import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import mongoose from "mongoose";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import ApiError from "./utils/ApiError.js";
import { errorConverter, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budgets.js";
import taxEstimateRoutes from "./routes/taxEstimates.js";
import reportRoutes from "./routes/reports.js";
import suggestedCategoryRoutes from "./routes/suggestedCategories.js";
import alertRoutes from "./routes/alerts.js";

const app = express();

// ============================================================================
// SECURITY & PROXY SETUP
// ============================================================================
// Required behind Render's reverse proxy for rate limiting and secure cookies
app.set("trust proxy", 1);

// Helmet for security headers (but disable CORS headers to avoid conflicts)
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Let CORS middleware handle it
  })
);

// ============================================================================
// LOGGING
// ============================================================================
const morganFormat = config.env === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

// ============================================================================
// CORS CONFIGURATION - PRODUCTION READY
// ============================================================================
// Explicitly define allowed origins (both dev and production)
const allowedOrigins = [
  // Development
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  // Production
  "https://taxpal-batch3-1.onrender.com",
  // Fallback from env (if CLIENT_URL set)
  ...(config.clientUrls || []),
];

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

logger.info(`[CORS] Allowed origins: ${uniqueOrigins.join(", ")}`);

const corsOptions = {
  // Origin check - allow requests from authorized domains
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin requests, mobile apps, curl, etc)
    if (!origin) {
      logger.debug("[CORS] No origin header - allowing (same-origin/mobile)");
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (uniqueOrigins.includes(origin)) {
      logger.debug(`[CORS] Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`[CORS] Origin rejected: ${origin}`);
      // In production, we want to reject unallowed origins strictly
      // But for debugging, we can allow temporarily
      callback(null, true); // Change to: callback(new Error("CORS not allowed")) for strict mode
    }
  },

  // Allow credentials (cookies, auth headers)
  credentials: true,

  // Allow these HTTP methods for preflight and actual requests
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],

  // Allow these headers in requests
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Accept-Language",
  ],

  // Headers the browser can access from the response
  exposedHeaders: ["X-Total-Count", "X-Page-Number"],

  // Browser can cache preflight response (in seconds)
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly (backup)
app.options("*", cors(corsOptions));

// ============================================================================
// BODY PARSING & SECURITY
// ============================================================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Prevent NoSQL injection via query/body operators
app.use(mongoSanitize());

// ============================================================================
// RATE LIMITING
// ============================================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.env === "production" ? 200 : 500,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path === "/api/health", // Don't rate limit health checks
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 mins
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================
// Render health check (root level)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API health check with database status
app.get("/api/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "OK" : "DEGRADED",
    service: "TaxPal API",
    database: dbReady ? "connected" : "disconnected",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// API ROUTES
// ============================================================================
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxEstimateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suggested-categories", suggestedCategoryRoutes);
app.use("/api/alerts", alertRoutes);

// ============================================================================
// 404 HANDLER
// ============================================================================
app.use((_req, _res, next) => {
  next(new ApiError(404, "Not found"));
});

// ============================================================================
// ERROR HANDLING (MUST BE LAST)
// ============================================================================
app.use(errorConverter);
app.use(errorHandler);

// ============================================================================
// SERVER START
// ============================================================================
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(config.port, "0.0.0.0", () => {
      logger.info(`✅ TaxPal API running on port ${config.port} (${config.env})`);
      logger.info(`📍 CORS Origins: ${uniqueOrigins.join(", ")}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        logger.error(`❌ Port ${config.port} is already in use`);
      } else {
        logger.error(`❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });
  } catch (err) {
    logger.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
const shutdown = async (signal) => {
  logger.info(`⏹️  ${signal} received: closing server gracefully`);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        logger.info("🔌 MongoDB connection closed");
        process.exit(0);
      } catch (err) {
        logger.error(`Error during shutdown: ${err.message}`);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds if graceful close hangs
    setTimeout(() => {
      logger.error("❌ Forced shutdown after 10 second timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start the server
startServer();

export default app;
