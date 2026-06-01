import { Router } from "express";
import * as budgetController from "../controllers/budget.controller.js";
import budgetValidation from "../validations/budget.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", validate(budgetValidation.getBudgets), budgetController.getBudgets);
router.post("/", validate(budgetValidation.createBudget), budgetController.createBudget);
router.get("/:id", budgetController.getBudget);
router.patch("/:id", validate(budgetValidation.updateBudget), budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

export default router;
