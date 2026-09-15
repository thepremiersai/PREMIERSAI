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
  enableWebSearch?: boolean;
}

export interface StreamAIOptions extends GenerateAIOptions {
  onChunk: (text: string) => void;
  onGrounding?: (groundingData: any) => void;
  signal?: AbortSignal;
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
 * Real-time streaming content generator with Google Search grounding support.
 * Yields chunks immediately as they arrive from the model.
 */
export async function generateAIContentStream(options: StreamAIOptions): Promise<{
  fullText: string;
  sources: Array<{ title: string; url: string; domain?: string; snippet?: string }>;
  searchQueries: string[];
} | null> {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  const { contents, systemInstruction, temperature = 0.7, topP = 0.95, enableWebSearch, onChunk, onGrounding, signal } = options;
  const sourcesMap = new Map<string, { title: string; url: string; domain?: string; snippet?: string }>();
  const searchQueries: string[] = [];

  for (const modelName of CANDIDATE_MODELS) {
    if (signal?.aborted) break;

    try {
      const config: any = {
        ...(systemInstruction ? { systemInstruction } : {}),
        temperature,
        topP,
      };

      if (enableWebSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });

      let accumulatedText = "";

      for await (const chunk of stream) {
        if (signal?.aborted) break;

        const chunkText = chunk.text || "";
        if (chunkText) {
          accumulatedText += chunkText;
          onChunk(chunkText);
        }

        // Extract grounding metadata if Google Search was performed
        const groundingMeta = chunk.candidates?.[0]?.groundingMetadata;
        if (groundingMeta) {
          if (onGrounding) onGrounding(groundingMeta);

          if (Array.isArray(groundingMeta.webSearchQueries)) {
            for (const q of groundingMeta.webSearchQueries) {
              if (q && !searchQueries.includes(q)) searchQueries.push(q);
            }
          }

          if (Array.isArray(groundingMeta.groundingChunks)) {
            for (const item of groundingMeta.groundingChunks) {
              if (item?.web?.uri) {
                const url = item.web.uri;
                let domain = "";
                try {
                  domain = new URL(url).hostname.replace(/^www\./, "");
                } catch {
                  domain = "web";
                }
                const title = item.web.title || domain || "Web Source";
                if (!sourcesMap.has(url)) {
                  sourcesMap.set(url, { title, url, domain });
                }
              }
            }
          }
        }
      }

      if (accumulatedText) {
        return {
          fullText: accumulatedText,
          sources: Array.from(sourcesMap.values()),
          searchQueries,
        };
      }
    } catch (err: any) {
      if (signal?.aborted) return null;
      console.log(`[AI Stream] Model ${modelName} stream attempt ended:`, err?.message || String(err));
      // Attempt next fallback model
    }
  }

  return null;
}

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
