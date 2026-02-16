import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/taxpal");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Falling back to in-memory storage (data will NOT persist)");
    // Don't exit - allow server to run for testing
  }
};

export default connectDB;
