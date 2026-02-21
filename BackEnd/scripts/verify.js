/**
 * Quick verify: MongoDB connection and API health.
 * Run: node scripts/verify.js
 */
import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tax1";
const API_URL = "http://localhost:4000";

async function verify() {
  console.log("1. Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("   OK – MongoDB connected (database: tax1)\n");

  console.log("2. Checking API health:", API_URL + "/api/health");
  try {
    const res = await fetch(API_URL + "/api/health");
    const data = await res.json();
    if (data.ok) console.log("   OK – Backend API is running\n");
    else console.log("   Response:", data);
  } catch (e) {
    console.log("   FAIL – Is the backend running? (npm run dev in backend folder)");
    console.log("   Error:", e.message);
  }

  await mongoose.disconnect();
  console.log("Done. Backend and DB are ready; start frontend with: cd frontend && npm run dev");
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
