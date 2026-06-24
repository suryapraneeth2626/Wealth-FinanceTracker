export type GeminiResponse = { text: string };

export async function callGemini(prompt: string): Promise<GeminiResponse> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }

    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as any).error)
        : `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  const data = (await res.json()) as GeminiResponse;
  if (!data || typeof data.text !== "string") {
    throw new Error("Invalid Gemini response");
  }
  return data;
}

