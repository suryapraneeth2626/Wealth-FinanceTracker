import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createGeminiProvider, getAIProviderErrorMessage } from "@/lib/ai-gateway.server";

interface ChatBody {
  messages?: UIMessage[];
  snapshot?: unknown;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages required", { status: 400 });
        }

        const key = process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing GEMINI_API_KEY", { status: 500 });

        const gemini = createGeminiProvider(key);
        const model = gemini("gemini-3.5-flash");

        const system = `You are Wealth, the user's personal AI financial analyst.
You have access to a JSON snapshot of their actual local financial data below.
Answer concisely with concrete numbers from the snapshot. Use their currency code.
Be warm but precise; never invent transactions or balances. If the snapshot lacks data, say so.

SNAPSHOT:
${JSON.stringify(body.snapshot ?? {}, null, 2)}`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onError: getAIProviderErrorMessage,
        });
      },
    },
  },
});
