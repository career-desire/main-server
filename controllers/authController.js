import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateToken.js";
import admin from "../config/firebase.js";

// Validate user
export const validateUser = async (req, res) => {
  const { name, email, mobile } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({ valid: false, message: "All fields are required." });
  }

  try {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    const existingMobile = await User.findOne({ mobile });

    if (existingEmail && existingMobile) {
      return res.status(409).json(
        { 
          valid: false, 
          message: "Email & Mobile number already registered.", 
          remainingAttempts: req.remainingAttempts 
        });
    }

    if (existingEmail) {
      return res.status(409).json(
        { 
          valid: false, 
          message: "Email already registered.", 
          remainingAttempts: req.remainingAttempts 
        });
    }

    if (existingMobile) {
      return res.status(409).json(
        { 
          valid: false, 
          message: "Mobile number already registered.", 
          remainingAttempts: req.remainingAttempts 
        });
    }

    return res.status(200).json(
      { 
        valid: true, 
        remainingAttempts: req.remainingAttempts, 
      });
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({ valid: false, message: "Server error. Please try again." });
  }
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, mobile, idToken } = req.body;

    if (!name || !email || !password || !mobile || !idToken) {
      return res.status(400).json({
        message: "All fields including OTP token are required.",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber || phoneNumber !== mobile) {
      return res.status(400).json({
        message: "Mobile number mismatch or missing in token."
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email or mobile."
      });
    }

    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    const user = await User.create({ name, email, password, mobile, role });

    const { accessToken, refreshToken } = generateTokens(user.id, user.name, user.role);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Registration failed:", err);

    let message = "Invalid or expired OTP token.";
    if (err.code === "auth/id-token-expired") {
      message = "OTP token expired. Please request a new one.";
    }

    return res.status(401).json({
      message
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      // domain: '.yourdomain.com',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Refresh token expired, please log in again" });
        }
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        // domain: '.yourdomain.com',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get Authenticated User
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { id: user.id, name: user.name, email: user.email, creditInfo: user.creditInfo } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    res.status(200).json({
      message: "OTP can be sent by Firebase client.",
      remainingAttempts: req.remainingAttempts,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { mobile, newPassword, idToken } = req.body;
    if (!mobile || !newPassword || !idToken) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.phone_number !== mobile) {
      return res.status(400).json({ message: "Mobile number mismatch" });
    }

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

// Logout User
export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};