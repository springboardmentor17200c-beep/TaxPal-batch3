import { Router } from "express";
import * as suggestedCategoryController from "../controllers/suggestedCategory.controller.js";
import suggestedCategoryValidation from "../validations/suggestedCategory.validation.js";
import { validate } from "../middleware/validate.js";
import { auth, authorize } from "../middleware/auth.js";

const router = Router();

// GET is accessible to authenticated users
router.get("/", auth, validate(suggestedCategoryValidation.getCategories), suggestedCategoryController.getCategories);

// POST and DELETE are restricted to admin role
router.post("/", auth, authorize("admin"), validate(suggestedCategoryValidation.createCategory), suggestedCategoryController.createCategory);
router.delete("/:id", auth, authorize("admin"), suggestedCategoryController.deleteCategory);

export default router;
