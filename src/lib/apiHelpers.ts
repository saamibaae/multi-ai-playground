export type ProviderKey = "openai" | "gemini" | "deepseek" | "zai";

export type ProviderSelection = {
  openai?: { apiKey: string; model?: string };
  zai?: { apiKey: string; model?: string };
  deepseek?: { apiKey: string; model?: string };
  gemini?: { apiKey: string; model?: string };
};

export async function callMultiChat(
  prompt: string,
  providers: ProviderSelection,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  image: { dataUrl: string; mimeType?: string } | null = null
) {
  const res = await fetch("/api/multi-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, providers, history, image }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json();
}


