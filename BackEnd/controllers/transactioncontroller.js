import Transaction from "../models/Transaction.js";
import { mockDB } from "../config/mockDB.js";
import mongoose from "mongoose";

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

export const addTransaction = async (req, res) => {
  try {
    const txDB = isMongoConnected() ? Transaction : mockDB.transactions;
    const tx = await txDB.create(req.body);
    res.json({ message: "Transaction Added", transaction: tx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const txDB = isMongoConnected() ? Transaction : mockDB.transactions;
    const list = await txDB.find();
    res.json({ message: "Transactions Retrieved", transactions: list, data: list });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
