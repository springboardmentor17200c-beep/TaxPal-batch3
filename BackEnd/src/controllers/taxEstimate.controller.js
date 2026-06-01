import TaxEstimate from "../models/TaxEstimate.js";
import Alert from "../models/Alert.js";
import { calculateTax } from "../taxEngine.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getTaxEstimates = catchAsync(async (req, res) => {
  const estimates = await TaxEstimate.find({ user_id: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  return successResponse(res, 200, estimates, "Tax estimates retrieved");
});

export const createTaxEstimate = catchAsync(async (req, res) => {
  const {
    country,
    state,
    filing_status,
    quarter,
    gross_income_for_quarter,
    business_expenses,
    retirement_contribution,
    health_insurance_premiums,
    home_office_deduction,
  } = req.body;

  const gross = Number(gross_income_for_quarter) || 0;

  const deductions =
    (Number(business_expenses) || 0) +
    (Number(retirement_contribution) || 0) +
    (Number(health_insurance_premiums) || 0) +
    (Number(home_office_deduction) || 0);

  const taxable = Math.max(0, gross - deductions);

  const { federalTax, stateTax, selfEmploymentTax, totalTax } = calculateTax({
    country:       country || "United States",
    state:         state   || "",
    filingStatus:  filing_status || "Single",
    taxableIncome: taxable,
    grossIncome:   gross,
  });

  const estimated_tax = totalTax;

  const yearMatch = quarter.match(/(\d{4})\)/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 2025;

  let dueDate = null;
  if (quarter.includes("Q1")) dueDate = new Date(`${year}-04-15`);
  if (quarter.includes("Q2")) dueDate = new Date(`${year}-06-15`);
  if (quarter.includes("Q3")) dueDate = new Date(`${year}-09-15`);
  if (quarter.includes("Q4")) dueDate = new Date(`${year + 1}-01-15`);

  const doc = await TaxEstimate.create({
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

  if (dueDate) {
    await Alert.create({
      user_id: req.user._id,
      type: "reminder",
      message: `Estimated tax payment due for ${quarter}`,
      alert_date: dueDate,
    });
  }

  return successResponse(res, 201, {
    ...doc.toObject(),
    estimated_tax,
    federalTax,
    stateTax,
    selfEmploymentTax,
    taxableIncome: taxable,
    totalDeductions: deductions,
    grossIncome: gross,
    effectiveRate: gross > 0 ? (estimated_tax / gross) * 100 : 0,
  }, "Tax estimate created and saved");
});

export const getCalendar = catchAsync(async (req, res) => {
  const alerts = await Alert.find({ user_id: req.user._id })
    .sort({ alert_date: 1 })
    .lean();
  return successResponse(res, 200, alerts, "Calendar events retrieved");
});

export const deleteTaxEstimate = catchAsync(async (req, res) => {
  const doc = await TaxEstimate.findOneAndDelete({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!doc) {
    throw new ApiError(404, "Tax estimate not found");
  }
  return res.status(204).send();
});
