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

router.post("/", async (req, res) => {
  try {
    // const { name, type, description } = req.body;
    const { name, type, description, color } = req.body;    
    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }
    
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
    }

    
    const category = new SuggestedCategory({
      name,
      type,
      description: description || "",
      color: color || "#ad2bf4",
    });

    await category.save();
    res.status(201).json(category);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).json({ error: "Category already exists" });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SuggestedCategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
