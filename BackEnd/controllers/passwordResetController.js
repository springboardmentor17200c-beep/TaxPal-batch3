import User from "../models/User.js";
import { mockDB } from "../config/mockDB.js";
import mongoose from "mongoose";
import { sendPasswordResetEmail } from "../config/email.js";

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Generate random reset code
const generateResetCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userDB = isMongoConnected() ? User : mockDB.users;
    const user = await userDB.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({ 
        message: "If an account exists with this email, a reset code will be sent" 
      });
    }

    // Generate reset code (6-digit alphanumeric)
    const resetCode = generateResetCode();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Update user with reset token
    if (isMongoConnected()) {
      await User.findByIdAndUpdate(user._id, {
        resetToken: resetCode,
        resetTokenExpiry: resetTokenExpiry
      });
    } else {
      user.resetToken = resetCode;
      user.resetTokenExpiry = resetTokenExpiry;
    }

    // Send email with reset code
    try {
      await sendPasswordResetEmail(email, resetCode);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error(`⚠️  Email sending failed: ${emailError.message}`);
      console.log(`\n🔐 PASSWORD RESET CODE for ${email}: ${resetCode} (expires in 15 minutes)\n`);
      // Don't fail the request if email fails - show code in console for testing
    }

    res.json({ 
      message: "Reset code sent to your email. Check your inbox!",
      // For development only - remove in production
      resetCode: resetCode
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({ error: "Email and reset code are required" });
    }

    const userDB = isMongoConnected() ? User : mockDB.users;
    const user = await userDB.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if reset code matches and hasn't expired
    if (user.resetToken !== resetCode) {
      return res.status(401).json({ error: "Invalid reset code" });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(401).json({ error: "Reset code has expired" });
    }

    res.json({ 
      message: "Reset code verified successfully",
      verified: true
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    if (!email || !resetCode || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const userDB = isMongoConnected() ? User : mockDB.users;
    const user = await userDB.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify reset code
    if (user.resetToken !== resetCode) {
      return res.status(401).json({ error: "Invalid reset code" });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(401).json({ error: "Reset code has expired" });
    }

    // Update password and clear reset token
    if (isMongoConnected()) {
      await User.findByIdAndUpdate(user._id, {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      });
    } else {
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
    }

    res.json({ 
      message: "Password reset successfully",
      success: true
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
