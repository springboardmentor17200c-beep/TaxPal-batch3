import { Router } from "express";
import * as suggestedCategoryController from "../controllers/suggestedCategory.controller.js";
import suggestedCategoryValidation from "../validations/suggestedCategory.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, validate(suggestedCategoryValidation.getCategories), suggestedCategoryController.getCategories);
router.post("/", auth, validate(suggestedCategoryValidation.createCategory), suggestedCategoryController.createCategory);
router.delete("/:id", auth, suggestedCategoryController.deleteCategory);

export default router;
