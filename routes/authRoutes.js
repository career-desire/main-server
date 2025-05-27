import express from "express";
import {
  login,
  logout,
  refreshToken,
  getMe,
  register,
  requestPasswordReset,
  resetPassword,
  validateUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { otpAttemptLimiter } from "../utils/attemptLimiter.js";

const router = express.Router();

// Registration with OTP verification and attempt limiting
router.post("/validate-user", otpAttemptLimiter, validateUser);
router.post("/register", register);

// Login & Token Management
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);

// Authenticated User Info
router.get("/me", protect, getMe);

// Password Reset
router.post("/forgot-password", otpAttemptLimiter, requestPasswordReset); 
router.post("/verify-password", resetPassword);

export default router;
