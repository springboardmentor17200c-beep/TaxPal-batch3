import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    budget_amount: { type: Number, required: true },
    month: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

budgetSchema.index({ user_id: 1, month: 1, category: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
