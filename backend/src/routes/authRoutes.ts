import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticationToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);

// Protected routes
router.get("/profile", authenticationToken, AuthController.getProfile);

export default router;
