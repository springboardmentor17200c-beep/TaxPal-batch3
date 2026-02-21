import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(auth);

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

router.get("/", async (req, res) => {
  try {
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
    res.json(withSpent);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { category, budget_amount, limit, month, description } = req.body;
    const amount = budget_amount != null ? Number(budget_amount) : Number(limit);
    if (!category || (amount !== amount)) {
      return res.status(400).json({ error: "category and budget amount are required" });
    }
    const monthStr = month || new Date().toISOString().slice(0, 7);
    const doc = await Budget.create({
      user_id: req.user._id,
      category,
      budget_amount: amount,
      month: monthStr,
      description: description || "",
    });
    const spentMap = await getSpentByCategory(req.user._id, monthStr);
    res.status(201).json({
      ...doc.toObject(),
      id: doc._id,
      budget: doc.budget_amount,
      spent: spentMap[doc.category] || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Budget.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const spentMap = await getSpentByCategory(req.user._id, doc.month);
    res.json({
      ...doc,
      id: doc._id,
      budget: doc.budget_amount,
      spent: spentMap[doc.category] || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
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
    if (!doc) return res.status(404).json({ error: "Not found" });
    const spentMap = await getSpentByCategory(req.user._id, doc.month);
    res.json({
      ...doc,
      id: doc._id,
      budget: doc.budget_amount,
      spent: spentMap[doc.category] || 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Budget.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
