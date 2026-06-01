import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;

async function main() {
  if (!MONGODB_URI) {
    console.error("FAIL – Set MONGODB_URI in BackEnd/.env");
    process.exit(1);
  }

  console.log("1. Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("   OK – MongoDB connected\n");

  console.log("2. Checking API health:", `${API_URL}/health`);
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    if (res.ok && data.status === "OK") {
      console.log("   OK – Backend health check passed\n");
    } else {
      console.log("   Unexpected response:", data);
    }
  } catch (e) {
    console.log("   FAIL – Is the backend running? (npm run dev in BackEnd)");
    console.log("   Error:", e.message);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
