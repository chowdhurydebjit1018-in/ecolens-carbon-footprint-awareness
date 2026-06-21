import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If it's a known AppError
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error("Non-operational AppError:", err, { requestId: req.id });
    }
    return sendError(res, err.statusCode, err.code, err.message, req.id as string);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const message = (err as any).errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return sendError(res, 400, "validation_error", `Validation failed: ${message}`, req.id as string);
  }

  // Fallback for unknown errors
  logger.error("Unhandled error:", err, { requestId: req.id });
  return sendError(res, 500, "internal_error", "An unexpected error occurred", req.id as string);
};
