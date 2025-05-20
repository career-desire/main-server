import rateLimit from "express-rate-limit";

// Create a rate limiter for OTP requests
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each mobile number to 5 OTP requests per window
  message: "Too many OTP requests, please try again later.",
  keyGenerator: (req) => req.body.mobile, // Rate limit per mobile number
});