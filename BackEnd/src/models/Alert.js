import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    alert_date: { type: Date, required: true },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ user_id: 1, alert_date: -1 });

export default mongoose.model("Alert", alertSchema);
