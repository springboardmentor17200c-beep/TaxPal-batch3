import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budgets.js";
import taxEstimateRoutes from "./routes/taxEstimates.js";
import reportRoutes from "./routes/reports.js";
import suggestedCategoryRoutes from "./routes/suggestedCategories.js";
import alertRoutes from "./routes/alerts.js";

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tax1";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxEstimateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/suggested-categories", suggestedCategoryRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`TaxPal API running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
