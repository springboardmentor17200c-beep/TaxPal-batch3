import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  type: String, // income or expense
  category: String,
  amount: Number,
  date: Date,
  notes: String
});

export default mongoose.model("Transaction", transactionSchema);
