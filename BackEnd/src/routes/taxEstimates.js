import { Router } from "express";
import * as taxEstimateController from "../controllers/taxEstimate.controller.js";
import taxEstimateValidation from "../validations/taxEstimate.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", taxEstimateController.getTaxEstimates);
router.post("/", validate(taxEstimateValidation.createTaxEstimate), taxEstimateController.createTaxEstimate);
router.get("/calendar", taxEstimateController.getCalendar);
router.delete("/:id", taxEstimateController.deleteTaxEstimate);

export default router;