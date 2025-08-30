import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticationToken } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { success: false, message: "Too many requests, try again later" },
});

// SIGNUP FLOW (OTP Required)
router.post("/send-signup-otp", authLimiter, AuthController.sendSignupOTP);
router.post("/verify-signup-otp", AuthController.verifyOTPAndSignup);

// Public routes
router.post("/login", authLimiter, AuthController.login);

// === GOOGLE OAUTH (will add later) ===
router.post("/google", authLimiter, AuthController.googleAuth);

// === SIMPLE LOGOUT ===
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully. Please remove token from client.",
  });
});

// Protected routes
router.get("/profile", authenticationToken, AuthController.getProfile);

export default router;
