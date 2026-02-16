import express from "express";
import { registerUser, loginUser } from "../controllers/authcontroller.js";
import { requestPasswordReset, verifyResetCode, resetPassword } from "../controllers/passwordResetController.js";

const router = express.Router();

// Login & Register
router.post("/register", registerUser);
router.post("/login", loginUser);

// Password Reset
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
