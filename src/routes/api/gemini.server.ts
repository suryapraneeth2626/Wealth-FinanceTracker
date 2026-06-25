import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BodySchema = {
  prompt: (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) return null;
    return trimmed;
  },
} as const;

export const Route = createFileRoute("/api/gemini/server")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const prompt = BodySchema.prompt((body as any)?.prompt);
        if (!prompt) {
          return Response.json(
            { error: "Missing/invalid 'prompt' (string)" },
            { status: 400 },
          );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }

        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const result = await model.generateContent(prompt);

          // The SDK returns a rich response; extract text safely.
          const text =
            (result as any)?.response?.text?.() ??
            (result as any)?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (typeof text !== "string" || !text.trim()) {
            return Response.json({ error: "Gemini returned empty response" }, { status: 502 });
          }

          return Response.json({ text: text.trim() });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Gemini request failed";

          // Best-effort status mapping for common failure modes.
          const status = message.includes("429") ? 429 : message.includes("401") ? 401 : 500;

          return Response.json(
            {
              error: "Gemini API error",
              message,
            },
            { status },
          );
        }
      },
    },
  },
});

