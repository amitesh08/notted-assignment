import { NextFunction, Request, Response } from "express";
import { AuthUtils } from "../utils/auth";
import prisma from "../config/database";

//Extend request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: String;
        email: String;
      };
    }
  }
}

export const authenticatinoToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; //Bearer Token

    if (!token) {
      return res.status(401).json({
        success: true,
        message: "Access token Required",
      });
    }

    const decoded = AuthUtils.verifyToken(token);

    //Verify user still exists
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token - user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};
