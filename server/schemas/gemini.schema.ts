import { z } from "zod";

export const AIInsightSchema = z.object({
  summary: z.string(),
  topCause: z.string(),
  recommendations: z.array(
    z.object({
      title: z.string(),
      impactKgCO2e: z.number(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      reason: z.string(),
    })
  ).default([]),
});

export const AIChatSchema = z.object({
  text: z.string(),
});
