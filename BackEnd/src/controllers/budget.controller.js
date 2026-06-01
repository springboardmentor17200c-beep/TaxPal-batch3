import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

async function getSpentByCategory(userId, month) {
  const start = new Date(month);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const agg = await Transaction.aggregate([
    { $match: { user_id: userId, type: "expense", date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);
  return Object.fromEntries(agg.map((a) => [a._id, Math.abs(a.spent)]));
}

export const getBudgets = catchAsync(async (req, res) => {
  const { month } = req.query;
  const filter = { user_id: req.user._id };
  if (month) filter.month = month;
  const list = await Budget.find(filter).sort({ month: -1, category: 1 }).lean();
  const spentMap = await getSpentByCategory(req.user._id, month || list[0]?.month || new Date().toISOString().slice(0, 7));
  const withSpent = list.map((b) => ({
    ...b,
    id: b._id,
    budget: b.budget_amount,
    spent: spentMap[b.category] || 0,
  }));
  return successResponse(res, 200, withSpent, "Budgets retrieved");
});

export const createBudget = catchAsync(async (req, res) => {
  const { category, budget_amount, limit, month, description } = req.body;
  const amount = budget_amount != null ? Number(budget_amount) : Number(limit);
  const monthStr = month || new Date().toISOString().slice(0, 7);
  const doc = await Budget.create({
    user_id: req.user._id,
    category,
    budget_amount: amount,
    month: monthStr,
    description: description || "",
  });
  const spentMap = await getSpentByCategory(req.user._id, monthStr);
  return successResponse(res, 201, {
    ...doc.toObject(),
    id: doc._id,
    budget: doc.budget_amount,
    spent: spentMap[doc.category] || 0,
  }, "Budget created");
});

export const getBudget = catchAsync(async (req, res) => {
  const doc = await Budget.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
  if (!doc) {
    throw new ApiError(404, "Budget not found");
  }
  const spentMap = await getSpentByCategory(req.user._id, doc.month);
  return successResponse(res, 200, {
    ...doc,
    id: doc._id,
    budget: doc.budget_amount,
    spent: spentMap[doc.category] || 0,
  }, "Budget retrieved");
});

export const updateBudget = catchAsync(async (req, res) => {
  const update = { ...req.body };
  if (update.limit != null) {
    update.budget_amount = Number(update.limit);
    delete update.limit;
  }
  const doc = await Budget.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    update,
    { new: true }
  ).lean();
  if (!doc) {
    throw new ApiError(404, "Budget not found");
  }
  const spentMap = await getSpentByCategory(req.user._id, doc.month);
  return successResponse(res, 200, {
    ...doc,
    id: doc._id,
    budget: doc.budget_amount,
    spent: spentMap[doc.category] || 0,
  }, "Budget updated");
});

export const deleteBudget = catchAsync(async (req, res) => {
  const doc = await Budget.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!doc) {
    throw new ApiError(404, "Budget not found");
  }
  return res.status(204).send();
});
