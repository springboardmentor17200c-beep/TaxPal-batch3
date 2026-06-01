import SuggestedCategory from "../models/SuggestedCategory.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getCategories = catchAsync(async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const list = await SuggestedCategory.find(filter).sort({ type: 1, name: 1 }).lean();
  return successResponse(res, 200, list, "Categories retrieved");
});

export const createCategory = catchAsync(async (req, res) => {
  const { name, type, description, color } = req.body;

  const category = new SuggestedCategory({
    name,
    type,
    description: description || "",
    color: color || "#ad2bf4",
  });

  await category.save();
  return successResponse(res, 201, category, "Category created successfully");
});

export const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await SuggestedCategory.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, "Category not found");
  }
  return successResponse(res, 200, null, "Category deleted successfully");
});
