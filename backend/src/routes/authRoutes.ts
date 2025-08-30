import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticationToken } from "../middleware/auth";

const router = Router();

// SIGNUP FLOW (OTP Required)
router.post("/send-signup-otp", AuthController.sendSignupOTP);
router.post("/verify-signup-otp", AuthController.verifyOTPAndSignup);

// Public routes
router.post("/login", AuthController.login);

// === GOOGLE OAUTH (will add later) ===
// router.post('/google', AuthController.googleAuth);

// Protected routes
router.get("/profile", authenticationToken, AuthController.getProfile);

export default router;
