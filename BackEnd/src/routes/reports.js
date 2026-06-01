import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import reportValidation from "../validations/report.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", reportController.getReports);
router.post("/", validate(reportValidation.createReport), reportController.createReport);
router.get("/download/:id", reportController.downloadReport);
router.get("/:id", reportController.getReport);
router.delete("/:id", reportController.deleteReport);

export default router;
