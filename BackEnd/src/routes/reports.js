import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Report from "../models/Report.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const list = await Report.find({ user_id: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(list.map((r) => ({ ...r, id: r._id, name: r.report_type, generated: r.createdAt, period: r.period, format: r.format || "PDF" })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { period, report_type, file_path, format } = req.body;
    if (!period || !report_type) {
      return res.status(400).json({ error: "period and report_type are required" });
    }
    const doc = await Report.create({
      user_id: req.user._id,
      period,
      report_type,
      file_path: file_path || "",
      format: format || "PDF",
    });
    res.status(201).json({
      ...doc.toObject(),
      id: doc._id,
      name: doc.report_type,
      generated: doc.createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ ...doc, id: doc._id, name: doc.report_type, generated: doc.createdAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Report.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
