import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebaseAdmin";
import { AuthenticationError } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";
import { logger } from "../utils/logger";

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or malformed authorization header");
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin Auth not initialized");
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    logger.error("Token verification failed", error, { requestId: req.id });
    throw new AuthenticationError("Invalid or expired token");
  }
});
