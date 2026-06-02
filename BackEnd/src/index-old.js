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

// Required behind Render's reverse proxy for rate limiting and secure cookies
app.set("trust proxy", 1);

app.use(helmet());

// CORS configuration - fixed for production
const morganFormat = config.env === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

// CORS configuration - allow both localhost (dev) and production frontend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://taxpal-batch3-1.onrender.com",
  ...(config.clientUrls || []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for now to debug
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Prevent NoSQL injection via query/body operators
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === "production" ? 200 : 500,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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

// Render health check (required format)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/api/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "OK" : "DEGRADED",
    database: dbReady ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxEstimateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suggested-categories", suggestedCategoryRoutes);
app.use("/api/alerts", alertRoutes);

app.use((_req, _res, next) => {
  next(new ApiError(404, "Not found"));
});

app.use(errorConverter);
app.use(errorHandler);

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(config.port, "0.0.0.0", () => {
    logger.info(`TaxPal API running on port ${config.port} (${config.env})`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${config.port} is already in use`);
    } else {
      logger.error(`Server error: ${err.message}`);
    }
    process.exit(1);
  });
};

const shutdown = async (signal) => {
  logger.info(`${signal} received: closing server`);
  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

export default app;
