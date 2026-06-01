import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
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

// Secure HTTP headers with Helmet
app.use(helmet());

// Logging middleware using Winston
const morganFormat = config.env === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

// CORS configuration for frontend domain
app.use(cors({ origin: config.clientUrl, credentials: true }));

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxEstimateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suggested-categories", suggestedCategoryRoutes);
app.use("/api/alerts", alertRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ status: "healthy", timestamp: new Date() }));

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Centralized error handler
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  app.listen(config.port, "0.0.0.0", () => {
    logger.info(`TaxPal API running at http://0.0.0.0:${config.port} in ${config.env} mode`);
  });
};

startServer();
