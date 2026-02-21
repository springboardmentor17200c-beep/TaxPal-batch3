import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true },
    report_type: { type: String, required: true },
    file_path: { type: String, default: "" },
    format: { type: String, default: "PDF" },
  },
  { timestamps: true }
);

reportSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
