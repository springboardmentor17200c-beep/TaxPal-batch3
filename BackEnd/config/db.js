import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = "mongodb+srv://faishalh994_db_user:NnM07AXKxTATw38b@cluster0.ppayswg.mongodb.net/taxpal";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas Connected - Data will be saved permanently!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Falling back to in-memory storage (data will NOT persist)");
    // Don't exit - allow server to run for testing
  }
};

export default connectDB;
