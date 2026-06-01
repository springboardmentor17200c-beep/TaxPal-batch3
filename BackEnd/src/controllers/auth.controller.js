import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/index.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  country: user.country,
  income_bracket: user.income_bracket,
  phone: user.phone,
  address: user.address,
  tax_id: user.tax_id,
  filing_status: user.filing_status,
  professional_role: user.professional_role,
  is_verified: user.is_verified,
  notifications: user.notifications,
  two_factor_enabled: user.two_factor_enabled,
  role: user.role,
});

export const register = catchAsync(async (req, res) => {
  const { name, email, password, country, income_bracket, phone, address, tax_id, filing_status, professional_role } = req.body;
  const emailClean = email.trim().toLowerCase();
  const existing = await User.findOne({ email: emailClean }).select("+password");
  if (existing) {
    const matches = await existing.comparePassword(password);
    if (!matches) {
      return successResponse(
        res,
        200,
        {
          requiresPasswordReset: true,
          email: emailClean,
        },
        "This email is already registered. Sign in or reset your password."
      );
    }
    const token = jwt.sign({ userId: existing._id }, config.jwt.secret, { expiresIn: "7d" });
    return successResponse(
      res,
      200,
      {
        user: {
          id: existing._id,
          name: existing.name,
          email: existing.email,
          country: existing.country,
          income_bracket: existing.income_bracket,
        },
        token,
      },
      "Signed in to your existing account"
    );
  }

  const user = await User.create({
    name: name.trim(),
    email: emailClean,
    password,
    country: country || "",
    income_bracket: income_bracket || "",
    phone: phone || "",
    address: address || "",
    tax_id: tax_id || "",
    filing_status: filing_status || "",
    professional_role: professional_role || "",
  });

  const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: "7d" });
  return successResponse(res, 201, {
    user: { id: user._id, name: user.name, email: user.email, country: user.country, income_bracket: user.income_bracket },
    token,
  }, "Registered successfully");
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const emailClean = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailClean }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const matches = await user.comparePassword(password);
  if (!matches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: "7d" });
  return successResponse(res, 200, {
    user: { id: user._id, name: user.name, email: user.email, country: user.country, income_bracket: user.income_bracket },
    token,
  }, "Logged in successfully");
});

export const getProfile = catchAsync(async (req, res) => {
  return successResponse(res, 200, sanitizeUser(req.user), "Profile retrieved");
});

export const updateProfile = catchAsync(async (req, res) => {
  const { name, email, country, income_bracket, phone, address, tax_id, filing_status, professional_role } = req.body;
  if (email && email.trim().toLowerCase() !== req.user.email) {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      throw new ApiError(400, "Email already registered");
    }
    req.user.email = email.trim().toLowerCase();
  }
  if (name) req.user.name = name.trim();
  if (country !== undefined) req.user.country = country;
  if (income_bracket !== undefined) req.user.income_bracket = income_bracket;
  if (phone !== undefined) req.user.phone = phone;
  if (address !== undefined) req.user.address = address;
  if (tax_id !== undefined) req.user.tax_id = tax_id;
  if (filing_status !== undefined) req.user.filing_status = filing_status;
  if (professional_role !== undefined) req.user.professional_role = professional_role;

  await req.user.save();
  return successResponse(res, 200, sanitizeUser(req.user), "Profile updated");
});

export const getNotifications = catchAsync(async (req, res) => {
  return successResponse(res, 200, req.user.notifications || {}, "Notifications retrieved");
});

export const updateNotifications = catchAsync(async (req, res) => {
  const updates = req.body || {};
  req.user.notifications = {
    ...req.user.notifications,
    ...updates,
  };
  await req.user.save();
  return successResponse(res, 200, req.user.notifications, "Notifications updated");
});

export const getSecurity = catchAsync(async (req, res) => {
  return successResponse(res, 200, {
    two_factor_enabled: req.user.two_factor_enabled,
    email: req.user.email,
  }, "Security settings retrieved");
});

export const updateSecurity = catchAsync(async (req, res) => {
  const { two_factor_enabled } = req.body;
  if (two_factor_enabled !== undefined) {
    req.user.two_factor_enabled = Boolean(two_factor_enabled);
  }
  await req.user.save();
  return successResponse(res, 200, { two_factor_enabled: req.user.two_factor_enabled }, "Security settings updated");
});

export const changePassword = catchAsync(async (req, res) => {
  const { current_password, new_password } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  const matches = await user.comparePassword(current_password);
  if (!matches) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = new_password;
  await user.save();
  return res.status(204).send();
});

export const resetPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const emailClean = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailClean }).select("+password");
  if (!user) {
    return successResponse(
      res,
      200,
      {},
      "If an account exists for this email, the password has been updated."
    );
  }
  user.password = password;
  await user.save();
  return successResponse(res, 200, {}, "Password updated successfully. You can sign in now.");
});
