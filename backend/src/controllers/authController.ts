import { Request, Response } from "express";
import { CreateUserInput, LoginInput } from "../types";
import { ValidationUtils } from "../utils/validation";
import prisma from "../config/database";
import { AuthUtils } from "../utils/auth";
import { OTPService } from "../services/otpServices";
import { EmailService } from "../services/emailService";
import { GoogleAuthService } from "../services/googleAuthService";

export class AuthController {
  // Send OTP with complete signup data
  static async sendSignupOTP(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validate all signup data upfront
      const validation = ValidationUtils.validateSignup(email, password, name);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const sanitizedEmail = ValidationUtils.sanitizeEmail(email);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Generate OTP and store complete signup data
      const otp = OTPService.generateAndStore(sanitizedEmail, password, name);
      const emailSent = await EmailService.sendOTP(sanitizedEmail, otp);

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email",
        });
      }

      res.json({
        success: true,
        message: "Verification code sent to your email",
        data: {
          email: sanitizedEmail,
          message:
            "Please check your email and enter the 6-digit verification code",
        },
      });
    } catch (error) {
      console.error("Send signup OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Verify OTP and complete signup (simplified)
  static async verifyOTPAndSignup(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const sanitizedEmail = ValidationUtils.sanitizeEmail(email);

      // Verify OTP and get stored signup data
      const otpResult = OTPService.verifyAndGetSignupData(sanitizedEmail, otp);

      if (!otpResult.isValid || !otpResult.signupData) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }

      // Check if user was created in the meantime
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash password and create user
      const hashedPassword = await AuthUtils.hashPassword(
        otpResult.signupData.password
      );

      const user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          password: hashedPassword,
          name: otpResult.signupData.name?.trim() || null,
        },
      });

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error("Verify OTP and signup error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //User Login
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginInput = req.body;

      const validation = ValidationUtils.validateLogin(email, password);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validaiton failed",
          errors: validation.errors,
        });
      }

      const sanitizeEmail = ValidationUtils.sanitizeEmail(email);

      //Find User
      const user = await prisma.user.findUnique({
        where: { email: sanitizeEmail },
      });

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      //compare password
      const isPasswordValid = await AuthUtils.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or Password",
        });
      }

      //genrate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Google OAuth
  static async googleAuth(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
      }

      // Verify Google token and get user data
      let googleUser;
      try {
        googleUser = await GoogleAuthService.verifyGoogleToken(idToken);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid Google token",
        });
      }

      if (!googleUser.verified) {
        return res.status(400).json({
          success: false,
          message: "Google email not verified",
        });
      }

      const sanitizedEmail = ValidationUtils.sanitizeEmail(googleUser.email);

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email: sanitizedEmail }, { googleId: googleUser.googleId }],
        },
      });

      if (user) {
        // User exists - update Google ID if not set
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: googleUser.googleId,
              name: user.name || googleUser.name,
            },
          });
        }
      } else {
        // Create new user with Google account
        user = await prisma.user.create({
          data: {
            email: sanitizedEmail,
            name: googleUser.name,
            googleId: googleUser.googleId,
            // No password for Google OAuth users
          },
        });
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: "Google authentication successful",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({
        success: false,
        message: "Google authentication failed",
      });
    }
  }
}
