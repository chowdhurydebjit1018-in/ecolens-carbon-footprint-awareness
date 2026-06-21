import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  CLIENT_ORIGIN: z.string().min(1, "CLIENT_ORIGIN is required"),
  
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, "FIREBASE_CLIENT_EMAIL is required"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
  
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GOOGLE_MAPS_API_KEY: z.string().min(1, "GOOGLE_MAPS_API_KEY is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid or missing environment variables. The server cannot start.");
  const errors = parsedEnv.error.flatten().fieldErrors;
  for (const [key, value] of Object.entries(errors)) {
    console.error(`   - ${key}: ${value}`);
  }
  process.exit(1);
}

export const env = parsedEnv.data;
