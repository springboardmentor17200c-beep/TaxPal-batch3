import Transaction from "../models/Transaction.js";

export const addTransaction = async (req, res) => {
  const tx = await Transaction.create(req.body);
  res.json(tx);
};

export const getTransactions = async (req, res) => {
  const list = await Transaction.find();
  res.json(list);
};
