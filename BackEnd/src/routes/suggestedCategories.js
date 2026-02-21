import { Router } from "express";
import SuggestedCategory from "../models/SuggestedCategory.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const list = await SuggestedCategory.find(filter).sort({ type: 1, name: 1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
