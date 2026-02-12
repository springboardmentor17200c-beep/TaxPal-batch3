import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  country: String,
  income_bracket: String
});

export default mongoose.model("User", userSchema);
