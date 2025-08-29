import bcrypt from "bcrypt";
import { JwtPayload } from "../types";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthUtils {
  //Hash Password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  //compare Password
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  //Generate JWT token
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  //Verify JWT token
  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  //Generate OTP
  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
