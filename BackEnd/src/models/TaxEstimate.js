import mongoose from "mongoose";

const taxEstimateSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    country: { type: String, default: "" },
    quarter: { type: String, required: true },
    estimated_tax: { type: Number, required: true },
    due_date: { type: Date },
    state: { type: String, default: "" },
    filing_status: { type: String, default: "" },
    gross_income_for_quarter: { type: Number },
    business_expenses: { type: Number },
    retirement_contribution: { type: Number },
    health_insurance_premiums: { type: Number },
    home_office_deduction: { type: Number },
  },
  { timestamps: true }
);

taxEstimateSchema.index({ user_id: 1, quarter: 1 });

export default mongoose.model("TaxEstimate", taxEstimateSchema);
