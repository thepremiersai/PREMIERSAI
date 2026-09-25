import { GoogleGenAI, ThinkingLevel } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
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
  thinkingLevel?: "HIGH" | "LOW" | "MINIMAL";
}

export interface StreamAIOptions extends GenerateAIOptions {
  onChunk: (text: string) => void;
  onGrounding?: (groundingData: any) => void;
  signal?: AbortSignal;
}

/**
 * Ordered list of official, supported Gemini models per gemini-api skill guidelines.
 * Modern default for basic text and complex reasoning is gemini-3.8-flash.
 */
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

/**
 * Real-time streaming content generator with automatic tool fallback and thinking config.
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

  const { contents, systemInstruction, temperature = 0.7, topP = 0.95, enableWebSearch, thinkingLevel, onChunk, onGrounding, signal } = options;
  const sourcesMap = new Map<string, { title: string; url: string; domain?: string; snippet?: string }>();
  const searchQueries: string[] = [];

  for (const modelName of CANDIDATE_MODELS) {
    if (signal?.aborted) break;

    // Try first with requested tools (e.g. Google Search Grounding), and if quota exhausted, try without tool
    const toolModes = enableWebSearch ? [true, false] : [false];

    for (const withSearch of toolModes) {
      if (signal?.aborted) break;

      try {
        const config: any = {
          ...(systemInstruction ? { systemInstruction } : {}),
          temperature,
          topP,
        };

        if (thinkingLevel && ThinkingLevel[thinkingLevel]) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel[thinkingLevel] };
        }

        if (withSearch) {
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

        if (accumulatedText.trim()) {
          return {
            fullText: accumulatedText,
            sources: Array.from(sourcesMap.values()),
            searchQueries,
          };
        }
      } catch (err: any) {
        if (signal?.aborted) return null;
        console.log(`[AI Stream] Model ${modelName} (withSearch: ${withSearch}) attempt ended:`, err?.message || String(err));
        // If search tool threw 429 quota error, loop will immediately try with withSearch=false
      }
    }
  }

  return null;
}

/**
 * Ultra-resilient content generator with automatic model failover,
 * exponential backoff on 503 high-demand / 429 rate limits, and tool fallback.
 */
export async function generateAIContent(options: GenerateAIOptions): Promise<string | null> {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  const { contents, systemInstruction, temperature = 0.7, topP = 0.95, responseMimeType, enableWebSearch, thinkingLevel } = options;

  for (const modelName of CANDIDATE_MODELS) {
    const toolModes = enableWebSearch ? [true, false] : [false];

    for (const withSearch of toolModes) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        try {
          const config: any = {
            ...(systemInstruction ? { systemInstruction } : {}),
            ...(responseMimeType ? { responseMimeType } : {}),
            temperature,
            topP,
          };

          if (thinkingLevel && ThinkingLevel[thinkingLevel]) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel[thinkingLevel] };
          }

          if (withSearch) {
            config.tools = [{ googleSearch: {} }];
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config,
          });

          if (response && response.text && response.text.trim()) {
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

          console.log(`[AI Dispatch] ${modelName} (withSearch: ${withSearch}) attempt ${attempts}/${maxAttempts}: ${is503OrBusy ? "503" : is429 ? "429" : "error"}`);

          if (withSearch && is429) {
            // Quota on search tool, break out to try without search
            break;
          }

          if ((is503OrBusy || is429) && attempts < maxAttempts) {
            const backoff = 250 * attempts + Math.floor(Math.random() * 200);
            await new Promise((resolve) => setTimeout(resolve, backoff));
          } else {
            break;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Converts raw 16-bit 24kHz Mono PCM audio buffer to a standard WAV audio container buffer.
 */
export function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Text-to-Speech generation using Gemini audio model: gemini-3.8-flash-lite-tts.
 * Returns base64 WAV audio string that is directly playable in browser.
 */
export async function generateAIAudio(
  text: string,
  voiceName: "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr" = "Kore"
): Promise<{ audioBase64: string; mimeType: string } | null> {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const cleanText = text.replace(/[*#`_~\[\]()]/g, "").slice(0, 1000);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: "Clear, warm, natural, and articulate",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Pcm = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Pcm) return null;

    const pcmBuffer = Buffer.from(base64Pcm, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);

    return {
      audioBase64: wavBuffer.toString("base64"),
      mimeType: "audio/wav",
    };
  } catch (error: any) {
    console.warn("[AI Audio TTS] Error:", error?.message || error);
    return null;
  }
}

/**
 * Audio Transcription using Gemini transcribe model: gemini-3.5-transcribe.
 * Transcribes pre-recorded speech or voice memos into text.
 */
export async function transcribeAIAudio(
  base64Audio: string,
  mimeType = "audio/webm"
): Promise<string | null> {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: base64Audio,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          { text: "Transcribe this audio recording accurately, preserving spoken language and words precisely without commentary." },
        ],
      },
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    console.warn("[AI Audio Transcribe] Error:", error?.message || error);
    return null;
  }
}

/**
 * AI Prompt Enhancer using gemini-3.8-flash.
 * Expands brief thoughts or commands into clear, highly effective structured prompts.
 */
export async function enhanceAIPrompt(rawPrompt: string): Promise<string | null> {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an elite Prompt Engineer for PREMIERS AI.
Transform this user draft/query into an exceptionally clear, highly detailed, context-rich prompt that produces the highest quality response.
Keep the exact same intent and language. Output ONLY the enhanced prompt itself without explanation or conversational filler:

User Draft:
"${rawPrompt}"`,
            },
          ],
        },
      ],
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    console.warn("[AI Prompt Enhance] Error:", error?.message || error);
    return null;
  }
}
