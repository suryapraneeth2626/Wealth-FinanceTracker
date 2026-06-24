import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey,
  });
}

export function getAIProviderErrorMessage(error: unknown) {
  if (error != null && typeof error === "object" && "responseBody" in error) {
    const responseBody = (error as { responseBody?: unknown }).responseBody;
    if (typeof responseBody === "string") {
      try {
        const parsed = JSON.parse(responseBody) as
          | Array<{ error?: { message?: unknown }; message?: unknown }>
          | {
              error?: { message?: unknown };
              message?: unknown;
            };
        const errorData = Array.isArray(parsed) ? parsed[0] : parsed;
        const message = errorData?.error?.message ?? errorData?.message;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      } catch {
        if (responseBody.trim()) return responseBody.trim();
      }
    }
  }
  return error instanceof Error ? error.message : "AI request failed";
}
