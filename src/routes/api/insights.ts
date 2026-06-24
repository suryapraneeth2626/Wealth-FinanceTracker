import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider, getAIProviderErrorMessage } from "@/lib/ai-gateway.server";

const ReportSchema = z.object({
  healthScore: z.number().min(0).max(100),
  disciplineScore: z.number().min(0).max(100),
  savingsQuality: z.number().min(0).max(100),
  riskLevel: z.enum(["low", "moderate", "elevated", "high"]),
  summary: z.string(),
  insights: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["tip", "warning", "win", "forecast"]),
      title: z.string(),
      body: z.string(),
    }),
  ),
  recommendations: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["tip", "warning", "win", "forecast"]),
      title: z.string(),
      body: z.string(),
    }),
  ),
  forecast: z.object({
    endOfMonthBalance: z.number(),
    projectedSavings: z.number(),
    note: z.string(),
  }),
});

const BodySchema = z.object({
  snapshot: z.object({
    currency: z.string(),
    monthlyIncome: z.number(),
    monthlyExpenses: z.number(),
    totalBalance: z.number(),
    savingsRate: z.number(),
    topCategories: z.array(z.object({ name: z.string(), value: z.number() })).max(10),
    monthlyTrend: z
      .array(z.object({ month: z.string(), income: z.number(), expense: z.number() }))
      .max(12),
    budgets: z
      .array(z.object({ category: z.string(), monthly: z.number(), spent: z.number() }))
      .max(20),
    goals: z.array(z.object({ name: z.string(), target: z.number(), saved: z.number() })).max(20),
    recentTransactions: z
      .array(
        z.object({
          date: z.string(),
          category: z.string(),
          amount: z.number(),
          type: z.string(),
          merchant: z.string().optional(),
        }),
      )
      .max(30),
  }),
});

export const Route = createFileRoute("/api/insights")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = BodySchema.safeParse(await request.json());
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const key = process.env.GEMINI_API_KEY;
        if (!key) return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

        const gemini = createGeminiProvider(key);
        const model = gemini("gemini-3.5-flash");

        const systemPrompt = `You are Wealth, a calm, precise personal finance analyst.
Analyze the user's local financial snapshot and return ONLY a JSON object matching this TypeScript shape (no prose, no markdown fences):

{
  "healthScore": number 0-100,
  "disciplineScore": number 0-100,
  "savingsQuality": number 0-100,
  "riskLevel": "low" | "moderate" | "elevated" | "high",
  "summary": string (2-3 sentences),
  "insights": Array<{ id: string, kind: "tip"|"warning"|"win"|"forecast", title: string, body: string }> (3-5 items),
  "recommendations": Array<{ id: string, kind: "tip"|"warning"|"win"|"forecast", title: string, body: string }> (3-5 items),
  "forecast": { endOfMonthBalance: number, projectedSavings: number, note: string }
}

Use the user's currency code when mentioning amounts in body text. Be specific: cite categories, percentages, and concrete amounts from the data. Keep each body under 220 characters.`;

        try {
          const { text } = await generateText({
            model,
            system: systemPrompt,
            prompt: `Snapshot:\n${JSON.stringify(parsed.data.snapshot, null, 2)}\n\nReturn the JSON object now.`,
          });
          const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
          const json = JSON.parse(cleaned);
          const report = ReportSchema.parse(json);
          return Response.json({ ...report, generatedAt: new Date().toISOString() });
        } catch (err) {
          const msg = getAIProviderErrorMessage(err);
          const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
          return Response.json({ error: msg }, { status });
        }
      },
    },
  },
});
