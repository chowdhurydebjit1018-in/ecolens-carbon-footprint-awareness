import { Response } from "express";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    source?: "live" | "fallback";
    message?: string;
  };
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
};

export const sendSuccess = <T>(res: Response, data: T, meta?: ApiSuccess<T>["meta"], statusCode = 200) => {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    ...(meta && { meta })
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, code: string, message: string, requestId?: string) => {
  const response: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      ...(requestId && { requestId })
    }
  };
  return res.status(statusCode).json(response);
};
