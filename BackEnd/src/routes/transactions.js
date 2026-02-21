import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
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
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, category, amount, date, description } = req.body;
    if (!type || !category || amount == null || !date) {
      return res.status(400).json({ error: "type, category, amount and date are required" });
    }
    const doc = await Transaction.create({
      user_id: req.user._id,
      type,
      category,
      amount: Number(amount),
      date: new Date(date),
      description: description || "",
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
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
    res.json({ income, expense, net: income - Math.abs(expense) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Transaction.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const doc = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Transaction.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
