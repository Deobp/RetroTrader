import jwt from "jsonwebtoken";
import { Request } from "express";


const JWT_SECRET = process.env.JWT_SECRET;

export const createToken = (payload: object, expiresIn: string | number = "1h"): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): any => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }
  return jwt.verify(token, JWT_SECRET);
};

// middleware for authentication, (context?), rewrite types
export const authenticateToken = (req: Request, res: any, next: any): void => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing." });
  }
  try {
    const user = verifyToken(token);
    // add user info to the request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
