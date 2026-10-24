import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type AiProviderId = "openai" | "google";

export function resolveAiProvider(): {
  model: LanguageModel;
  provider: AiProviderId;
  modelId: string;
} | null {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const openai = createOpenAI({ apiKey: openaiKey });
    return { model: openai(modelId), provider: "openai", modelId };
  }

  const googleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (googleKey) {
    const modelId = process.env.GOOGLE_MODEL?.trim() || "gemini-2.5-flash";
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return { model: google(modelId), provider: "google", modelId };
  }

  return null;
}

export function missingAiKeyMessage(): string {
  return (
    "AI-avain puuttuu. Lisää OPENAI_API_KEY tai GOOGLE_GENERATIVE_AI_API_KEY " +
    "(tai GEMINI_API_KEY) tiedostoon .env.local — katso .env.example."
  );
}
