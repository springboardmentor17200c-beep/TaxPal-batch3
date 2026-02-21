import mongoose from "mongoose";

const suggestedCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

suggestedCategorySchema.index({ type: 1, name: 1 }, { unique: true });

export default mongoose.model("SuggestedCategory", suggestedCategorySchema);
