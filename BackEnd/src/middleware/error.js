import mongoose from "mongoose";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message;

    // Map mongoose errors
    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
    } else if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `Invalid path: ${error.path}`;
    } else if (error.code === 11000) {
      statusCode = 409;
      message = "Resource already exists (duplicate key error)";
    }

    error = new ApiError(statusCode, message || "Internal Server Error", false, err.stack);
  }
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  } else {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(statusCode).send(response);
};
