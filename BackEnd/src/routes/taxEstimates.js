import { Router } from "express";
import { auth } from "../middleware/auth.js";
import TaxEstimate from "../models/TaxEstimate.js";
import Alert from "../models/Alert.js";

const router = Router();
router.use(auth);

/*
GET ALL TAX ESTIMATES
*/
router.get("/", async (req, res) => {
  try {
    const estimates = await TaxEstimate.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(estimates);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*
SAVE TAX ESTIMATE
*/
router.post("/", async (req, res) => {
  try {
    const {
      country,
      state,
      filing_status,
      quarter,
      estimated_tax,
      gross_income_for_quarter,
      business_expenses,
      retirement_contribution,
      health_insurance_premiums,
      home_office_deduction,
    } = req.body;

    let dueDate = null;

    if (quarter.includes("Q1")) dueDate = new Date("2025-04-15");
    if (quarter.includes("Q2")) dueDate = new Date("2025-06-15");
    if (quarter.includes("Q3")) dueDate = new Date("2025-09-15");
    if (quarter.includes("Q4")) dueDate = new Date("2026-01-15");

    const estimate = await TaxEstimate.create({
      user_id: req.user._id,
      country,
      state,
      filing_status,
      quarter,
      estimated_tax,
      due_date: dueDate,
      gross_income_for_quarter,
      business_expenses,
      retirement_contribution,
      health_insurance_premiums,
      home_office_deduction,
    });

    /*
    CREATE ALERT FOR TAX DUE DATE
    */

    if (dueDate) {
      await Alert.create({
        user_id: req.user._id,
        type: "tax_due",
        message: `Estimated tax payment due for ${quarter}`,
        alert_date: dueDate,
      });
    }

    res.status(201).json(estimate);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*
GET TAX CALENDAR EVENTS
*/
router.get("/calendar", async (req, res) => {
  try {
    const alerts = await Alert.find({ user_id: req.user._id })
      .sort({ alert_date: 1 })
      .lean();

    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/*
DELETE TAX ESTIMATE
*/
router.delete("/:id", async (req, res) => {
  try {
    const doc = await TaxEstimate.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!doc) return res.status(404).json({ error: "Not found" });

    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;