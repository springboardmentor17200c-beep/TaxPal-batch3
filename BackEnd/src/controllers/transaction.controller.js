import Transaction from "../models/Transaction.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getTransactions = catchAsync(async (req, res) => {
  const { type, category, from, to } = req.query;
  const filter = { user_id: req.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const list = await Transaction.find(filter).sort({ date: -1 }).lean();
  return successResponse(res, 200, list, "Transactions retrieved");
});

export const createTransaction = catchAsync(async (req, res) => {
  const { type, category, amount, date, description } = req.body;
  const doc = await Transaction.create({
    user_id: req.user._id,
    type,
    category,
    amount: Number(amount),
    date: new Date(date),
    description: description || "",
  });
  return successResponse(res, 201, doc, "Transaction created");
});

export const getSummary = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const match = { user_id: req.user._id };
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  const summary = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const income = summary.find((s) => s._id === "income")?.total || 0;
  const expense = summary.find((s) => s._id === "expense")?.total || 0;
  return successResponse(res, 200, { income, expense, net: income - Math.abs(expense) }, "Summary retrieved");
});

export const getTransaction = catchAsync(async (req, res) => {
  const doc = await Transaction.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
  if (!doc) {
    throw new ApiError(404, "Transaction not found");
  }
  return successResponse(res, 200, doc, "Transaction retrieved");
});

export const updateTransaction = catchAsync(async (req, res) => {
  const doc = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true }
  );
  if (!doc) {
    throw new ApiError(404, "Transaction not found");
  }
  return successResponse(res, 200, doc, "Transaction updated");
});

export const deleteTransaction = catchAsync(async (req, res) => {
  const doc = await Transaction.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!doc) {
    throw new ApiError(404, "Transaction not found");
  }
  return res.status(204).send();
});
