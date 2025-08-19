"use client";

import type { ProviderId } from "@/lib/sessions";

export type ProviderCallInput = {
  provider: ProviderId;
  model: string;
  apiKey: string;
  prompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  image?: { dataUrl: string; mimeType?: string } | null;
};

export type ProviderResult = { type: "final"; text: string } | { type: "error"; error: string } | { type: "token"; text: string };

export type ProviderHandler = (input: ProviderCallInput, signal: AbortSignal) => AsyncGenerator<ProviderResult, ProviderResult>;

// Non-streaming default implementation wraps the app's /api/multi-chat endpoint per provider
export const defaultHandler: ProviderHandler = async function* (input, signal) {
  try {
    const res = await fetch("/api/multi-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        prompt: input.prompt,
        providers: { [input.provider]: { apiKey: input.apiKey, model: input.model } },
        historyByProvider: { [input.provider]: input.history },
        image: input.image ?? null,
      }),
    });
    const data = await res.json();
    const output = data?.responses?.[input.provider]?.output || data?.responses?.[input.provider]?.error || "";
    return { type: "final", text: output } as ProviderResult;
  } catch (e) {
    return { type: "error", error: (e as Error).message } as ProviderResult;
  }
};

export type ProviderRegistry = Partial<Record<ProviderId, ProviderHandler>>;

export const registry: ProviderRegistry = {
  openai: defaultHandler,
  gemini: defaultHandler,
  deepseek: defaultHandler,
  zai: defaultHandler,
};


