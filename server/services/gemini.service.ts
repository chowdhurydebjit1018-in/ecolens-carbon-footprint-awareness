import { ai } from "../config/gemini";
import { logger } from "../utils/logger";
import { AIInsightSchema } from "../schemas/gemini.schema";

export const generateInsights = async (activities: any[], profile: any) => {
  if (!ai) {
    throw new Error("Gemini client is not initialized because the GEMINI_API_KEY environment variable is missing.");
  }

  const summaryPrompt = `
    You are EcoLens AI, an expert environmental and sustainability carbon analyst.
    Analyze the user's carbon footprint based on their profile and logged activities below:

    USER PROFILE:
    - Name: ${profile?.name || "EcoWarrior"}
    - City: ${profile?.city || "Unknown City"}
    - Lifestyle Segment: ${profile?.lifestyleType || "default"}
    - Primary Transport Fuel / Mode: ${profile?.primaryTransport || "Unknown"}
    - Carbon reduction target: Reduce emissions by ${profile?.goalPercent || 15}%

    LOGGED ACTIVITIES (Last 30 Days):
    ${JSON.stringify(activities || [])}

    Your task is to yield a helpful diagnostic assessment of their carbon expenditure structure and formulate highly realistic, actionable, and category-focused sustainability advice.

    Respond STRICTLY in JSON format. Do not wrap code in extra text, but you must output valid parseable JSON conforming to this TypeScript definition:

    {
      "summary": "A concise, 2-3 sentence overview assessing their total carbon footprint relative to standard state/local profiles. Note areas they are performing successfully in.",
      "topCause": "The category or activity type contributing most heavily to their current emission footprint (e.g. 'Gasoline driving' or 'High grid electric usage' or 'Heavy consumption of beef/dairy').",
      "recommendations": [
        {
          "title": "A short, engaging action item (e.g., 'Incorporate 2 Vegan Days/Week')",
          "impactKgCO2e": 12.4, // Estimate of monthly reduction in kilograms of CO2e
          "difficulty": "easy", // "easy" | "medium" | "hard"
          "reason": "Specific rationale connecting this action directly to their logged carbon footprint data, explaining how to execute it easily."
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: summaryPrompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a precise, data-backed carbon footprint sustainability analyst. Speak objectively, in clean human labels. Never use hype.",
      },
    });

    const text = response.text || "{}";
    const rawInsights = JSON.parse(text);
    return AIInsightSchema.parse(rawInsights);
  } catch (error) {
    logger.error("Failed to parse Gemini insight response, using fallback", error);
    return {
      summary: "Your carbon footprint highlights standard consumption habits. Continue logging to generate precise models.",
      topCause: "Insufficient precise data",
      recommendations: [
        {
          title: "Log Daily Habits",
          impactKgCO2e: 5.0,
          difficulty: "easy",
          reason: "Logging consistent data establishes a stable baseline for our models."
        }
      ]
    };
  }
};

export const generateChat = async (messages: any[], profile: any, currentStats: any) => {
  if (!ai) {
    throw new Error("Gemini client is not initialized because the GEMINI_API_KEY environment variable is missing.");
  }

  const chatPrompt = `
    You are EcoGuide, a warm, highly-knowledgeable AI Sustainability Companion.
    
    USER CONTEXT:
    - Name: ${profile?.name || "User"}
    - City: ${profile?.city || "Unknown"}
    - Lifestyle: ${profile?.lifestyleType || "Standard"}
    - Primary Transport: ${profile?.primaryTransport || "Unknown"}
    - Weekly Impact Stats: Total ${currentStats?.weeklyTotal || 0} kg CO₂e logged.
    
    CONVERSATION HISTORY:
    ${messages.map((m: any) => `${m.sender === "user" ? "User" : "EcoLens Assistant"}: ${m.text}`).join("\n")}
    
    Respond as EcoGuide. Provide friendly, conversational, and highly specific sustainability advice. Keep comments compact, engaging, and structured with clear paragraphs. Avoid listing raw system details.
    If relevant, you can also output a list of 2 or 3 recommended action recommendations in a JSON-friendly block, but keep the response in clean text format as the primary bubble. Do not mention system flags or port numbers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
    });

    return response.text || "I am here to support you on your green journey!";
  } catch (error) {
    logger.error("Failed to get chat response, using fallback", error);
    return "I'm currently unable to connect to the knowledge core. Let's keep exploring your dashboard in the meantime.";
  }
};
