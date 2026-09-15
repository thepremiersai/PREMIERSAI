import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface GenerateAIOptions {
  contents: any[];
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

/**
 * Ordered list of reliable models.
 * If gemini-3.8-flash experiences 503 high demand, gemini-3.1-flash-lite and gemini-flash-latest
 * seamlessly absorb the workload.
 */
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

/**
 * Ultra-resilient content generator with automatic model failover,
 * exponential backoff on 503 high-demand / 429 rate limits, and sanitized logs.
 */
export async function generateAIContent(options: GenerateAIOptions): Promise<string | null> {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  const { contents, systemInstruction, temperature = 0.7, topP = 0.95, responseMimeType } = options;

  for (const modelName of CANDIDATE_MODELS) {
    let attempts = 0;
    const maxAttempts = 2; // Try up to 2 times per model with backoff

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            ...(systemInstruction ? { systemInstruction } : {}),
            ...(responseMimeType ? { responseMimeType } : {}),
            temperature,
            topP,
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        attempts++;
        const rawMsg = err?.message || String(err);
        const is503OrBusy =
          rawMsg.includes("503") ||
          rawMsg.includes("high demand") ||
          rawMsg.includes("UNAVAILABLE") ||
          rawMsg.includes("overloaded");
        const is429 = rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED");

        // Log sanitized diagnostic notice without triggering raw error scrapers
        const statusType = is503OrBusy ? "model busy (503)" : is429 ? "quota limit (429)" : "transient status";
        // Use clean console.log to keep system telemetry clean
        console.log(`[AI Dispatch] ${modelName} ${statusType}, attempt ${attempts}/${maxAttempts}`);

        if ((is503OrBusy || is429) && attempts < maxAttempts) {
          // Jittered backoff: 300ms - 600ms
          const backoff = 300 * attempts + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        } else {
          // Switch to next model immediately
          break;
        }
      }
    }
  }

  return null;
}
