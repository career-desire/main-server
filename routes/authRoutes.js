import express from "express";
import {
  login,
  logout,
  refreshToken,
  getMe,
  registerWithOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerWithOTP);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;