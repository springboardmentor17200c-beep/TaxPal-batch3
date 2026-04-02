import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String, default: "" },
    income_bracket: { type: String, default: "" },

    // profile fields
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    tax_id: { type: String, default: "" },
    filing_status: { type: String, default: "" },
    professional_role: { type: String, default: "" },
    is_verified: { type: Boolean, default: false },

    // notification preferences
    notifications: {
      email_alerts: { type: Boolean, default: true },
      budget_warnings: { type: Boolean, default: true },
      tax_reminders: { type: Boolean, default: true },
      weekly_digest: { type: Boolean, default: false },
      monthly_report: { type: Boolean, default: true },
      quiet_hours_enabled: { type: Boolean, default: false },
      quiet_start: { type: String, default: "22:00" },
      quiet_end: { type: String, default: "07:00" },
    },

    // security settings
    two_factor_enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
