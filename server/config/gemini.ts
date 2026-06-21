import { GoogleGenAI } from "@google/genai";
import { env } from "./env";
import { logger } from "../utils/logger";

export let ai: GoogleGenAI | null = null;

if (env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  logger.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
}
