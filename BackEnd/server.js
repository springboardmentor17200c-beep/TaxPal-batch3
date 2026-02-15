import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transaction.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("TaxPal Backend Running");
});

app.listen(5000, () => console.log("Server running on 5000"));
