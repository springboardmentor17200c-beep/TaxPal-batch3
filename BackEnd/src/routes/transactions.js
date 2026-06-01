import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import transactionValidation from "../validations/transaction.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", validate(transactionValidation.getTransactions), transactionController.getTransactions);
router.post("/", validate(transactionValidation.createTransaction), transactionController.createTransaction);
router.get("/summary", validate(transactionValidation.getSummary), transactionController.getSummary);
router.get("/:id", transactionController.getTransaction);
router.patch("/:id", validate(transactionValidation.updateTransaction), transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

export default router;
