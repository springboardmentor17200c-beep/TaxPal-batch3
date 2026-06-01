import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import authValidation from "../validations/auth.validation.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";

const router = require("express").Router();

router.post("/register", validate(authValidation.register), authController.register);
router.post("/login", validate(authValidation.login), authController.login);
router.post("/reset-password", validate(authValidation.resetPassword), authController.resetPassword);
router.get("/profile", auth, authController.getProfile);
router.patch("/profile", auth, validate(authValidation.updateProfile), authController.updateProfile);
router.get("/notifications", auth, authController.getNotifications);
router.patch("/notifications", auth, authController.updateNotifications);
router.get("/security", auth, authController.getSecurity);
router.patch("/security", auth, authController.updateSecurity);
router.post("/change-password", auth, validate(authValidation.changePassword), authController.changePassword);

export default router;
