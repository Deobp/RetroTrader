import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserError } from "../utils/user-error";

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return next(new UserError("Authentication token is missing.", 401));
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as JwtPayload;

    (req as Request & { user: { id: string; role: string } }).user = { id: payload.id, role: payload.role };

    next();
  } catch (error) {
    next(new UserError("Invalid or expired token.", 401));
  }
};
