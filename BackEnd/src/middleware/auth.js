import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";
import ApiError from "../utils/ApiError.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      throw new ApiError(401, "Authentication required");
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, "User not found");
    }
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof ApiError) {
      return next(e);
    }
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden: Insufficient privileges"));
  }
  next();
};
