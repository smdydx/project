import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT Configuration
const SECRET_KEY = process.env.JWT_SECRET || "lcrpay-secret-key-change-in-production-2024";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

export interface TokenPayload {
  userId: number;
  MobileNumber: string;
  token_type: string;
  iat: number;
  exp: number;
}

// JWT Helper Functions
export function createAccessToken(userId: number, MobileNumber: string): string {
  const payload = {
    userId,
    MobileNumber,
    token_type: "access",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
  };
  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM as jwt.Algorithm });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { 
      algorithms: [ALGORITHM as jwt.Algorithm] 
    }) as TokenPayload;
    
    if (decoded.token_type !== "access") {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// Authentication Middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);

    if (!tokenData) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user data to request
    (req as any).user = {
      userId: tokenData.userId,
      MobileNumber: tokenData.MobileNumber
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
