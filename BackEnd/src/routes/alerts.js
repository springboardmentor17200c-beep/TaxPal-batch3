import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Alert from "../models/Alert.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const list = await Alert.find({ user_id: req.user._id }).sort({ alert_date: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const doc = await Alert.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { is_read: true },
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
    const doc = await Alert.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
