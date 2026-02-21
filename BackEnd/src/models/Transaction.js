import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ user_id: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);
