import { Request, Response } from "express";
import { env } from "../config/env";
import { sendSuccess } from "../utils/apiResponse";

export const getHealth = (req: Request, res: Response) => {
  return sendSuccess(res, {
    status: "ok",
    environment: env.NODE_ENV,
    services: {
      firebase: env.FIREBASE_PROJECT_ID ? "configured" : "missing",
      gemini: env.GEMINI_API_KEY ? "configured" : "missing",
      googleMaps: env.GOOGLE_MAPS_API_KEY ? "configured" : "missing"
    }
  });
};
