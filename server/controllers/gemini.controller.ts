import { Request, Response, NextFunction } from "express";
import { generateInsights, generateChat } from "../services/gemini.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getInsights = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { activities, profile } = req.body;
  const insights = await generateInsights(activities, profile);
  return sendSuccess(res, insights);
});

export const getChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { messages, profile, currentStats } = req.body;
  const text = await generateChat(messages, profile, currentStats);
  return sendSuccess(res, { text });
});
