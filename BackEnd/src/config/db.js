import mongoose from "mongoose";
import { config } from "./index.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully.");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected.");
    });

    await mongoose.connect(config.mongoose.url, config.mongoose.options);
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
