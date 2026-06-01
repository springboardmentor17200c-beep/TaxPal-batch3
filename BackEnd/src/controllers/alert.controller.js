import Alert from "../models/Alert.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAlerts = catchAsync(async (req, res) => {
  const list = await Alert.find({ user_id: req.user._id }).sort({ alert_date: -1 }).lean();
  return successResponse(res, 200, list, "Alerts retrieved");
});

export const readAlert = catchAsync(async (req, res) => {
  const doc = await Alert.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { is_read: true },
    { new: true }
  );
  if (!doc) {
    throw new ApiError(404, "Alert not found");
  }
  return successResponse(res, 200, doc, "Alert marked as read");
});

export const deleteAlert = catchAsync(async (req, res) => {
  const doc = await Alert.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!doc) {
    throw new ApiError(404, "Alert not found");
  }
  return res.status(204).send();
});
