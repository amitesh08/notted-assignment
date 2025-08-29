import { Request, Response } from "express";
import { CreateUserInput, LoginInput } from "../types";
import { ValidationUtils } from "../utils/validation";
import prisma from "../config/database";
import { AuthUtils } from "../utils/auth";

export class AuthController {
  //user Signup
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, name }: CreateUserInput = req.body;

      //validate Input
      const validation = ValidationUtils.validateSignup(email, password, name);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const sanitizeEmail = ValidationUtils.sanitizeEmail(email);

      //check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizeEmail },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exist with this email",
        });
      }

      //hash Password
      const hashedPassword = await AuthUtils.hashPassword(password);

      //create user
      const user = await prisma.user.create({
        data: {
          email: sanitizeEmail,
          password: hashedPassword,
          name: name?.trim() || null,
        },
      });

      //Generate JWT token
      const token = await AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      res.status(200).json({
        success: true,
        message: "User Created Successfully",
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
      console.error("Signup error:", error);
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
}
