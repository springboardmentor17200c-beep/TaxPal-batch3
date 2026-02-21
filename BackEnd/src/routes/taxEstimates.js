import { Router } from "express";
import { auth } from "../middleware/auth.js";
import TaxEstimate from "../models/TaxEstimate.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const list = await TaxEstimate.find({ user_id: req.user._id }).sort({ quarter: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      country,
      quarter,
      estimated_tax,
      due_date,
      state,
      filing_status,
      gross_income_for_quarter,
      business_expenses,
      retirement_contribution,
      health_insurance_premiums,
      home_office_deduction,
    } = req.body;
    if (quarter == null || estimated_tax == null) {
      return res.status(400).json({ error: "quarter and estimated_tax are required" });
    }
    const doc = await TaxEstimate.create({
      user_id: req.user._id,
      country: country || "",
      quarter,
      estimated_tax: Number(estimated_tax),
      due_date: due_date ? new Date(due_date) : undefined,
      state: state || "",
      filing_status: filing_status || "",
      gross_income_for_quarter: gross_income_for_quarter != null ? Number(gross_income_for_quarter) : undefined,
      business_expenses: business_expenses != null ? Number(business_expenses) : undefined,
      retirement_contribution: retirement_contribution != null ? Number(retirement_contribution) : undefined,
      health_insurance_premiums: health_insurance_premiums != null ? Number(health_insurance_premiums) : undefined,
      home_office_deduction: home_office_deduction != null ? Number(home_office_deduction) : undefined,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await TaxEstimate.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const doc = await TaxEstimate.findOneAndUpdate(
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
    const doc = await TaxEstimate.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
