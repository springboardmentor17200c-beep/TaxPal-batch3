import { Router } from "express";
import * as alertController from "../controllers/alert.controller.js";
import alertValidation from "../validations/alert.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", alertController.getAlerts);
router.patch("/:id/read", validate(alertValidation.readAlert), alertController.readAlert);
router.delete("/:id", validate(alertValidation.deleteAlert), alertController.deleteAlert);

export default router;
