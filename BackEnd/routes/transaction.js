import express from "express";
import { transactions } from "../data/db.js";

const router = express.Router();

router.post("/add", (req, res) => {
  const transaction = req.body;
  transactions.push(transaction);
  res.json({ message: "Transaction Added", transaction });
});

router.get("/dashboard", (req, res) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  res.json({
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    transactions,
  });
});

export default router;
