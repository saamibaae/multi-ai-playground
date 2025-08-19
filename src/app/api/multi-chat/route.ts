import { NextRequest, NextResponse } from "next/server";

type ProviderSelection = {
  openai?: { apiKey: string; model?: string };
  zai?: { apiKey: string; model?: string };
  deepseek?: { apiKey: string; model?: string };
  gemini?: { apiKey: string; model?: string };
};

type MultiChatRequest = {
  prompt: string;
  providers: ProviderSelection;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  historyByProvider?: Partial<Record<"openai" | "zai" | "deepseek" | "gemini", Array<{ role: "user" | "assistant"; content: string }>>>;
  image?: { dataUrl: string; mimeType?: string } | null;
};

// Types for OpenAI messages and responses
type OpenAITextPart = { type: "text"; text: string };
type OpenAIImageUrlPart = { type: "image_url"; image_url: { url: string } };
type OpenAIMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "system" | "user" | "assistant"; content: Array<OpenAITextPart | OpenAIImageUrlPart> };

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

// Types for Z.ai and Deepseek (OpenAI-compatible)
type OpenAIStyleChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

// Types for Gemini
type GeminiPart = { text?: string } | { inline_data?: { mime_type: string; data: string } };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, providers, history = [], historyByProvider, image = null } = (await req.json()) as MultiChatRequest;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    if (!providers || typeof providers !== "object") {
      return NextResponse.json(
        { error: "Missing 'providers' in request body" },
        { status: 400 }
      );
    }

    type ProviderResult = { model: string; output: string | null; error: string | null };
    const tasks: Array<Promise<[string, ProviderResult]>> = [];

    if (providers.openai?.apiKey) {
      tasks.push(
        callOpenAI(
          providers.openai.apiKey,
          prompt,
          providers.openai.model,
          historyByProvider?.openai ?? history,
          image
        )
          .then((res): [string, ProviderResult] => [
            "openai",
            { model: res.model, output: res.output, error: null },
          ])
          .catch((err): [string, ProviderResult] => [
            "openai",
            { model: providers.openai?.model ?? defaultModels.openai, output: null, error: errorMessage(err) },
          ])
      );
    }

    if (providers.zai?.apiKey) {
      tasks.push(
        callZai(providers.zai.apiKey, prompt, providers.zai.model, historyByProvider?.zai ?? history)
          .then((res): [string, ProviderResult] => [
            "zai",
            { model: res.model, output: res.output, error: null },
          ])
          .catch((err): [string, ProviderResult] => [
            "zai",
            { model: providers.zai?.model ?? defaultModels.zai, output: null, error: errorMessage(err) },
          ])
      );
    }

    if (providers.deepseek?.apiKey) {
      tasks.push(
        callDeepseek(
          providers.deepseek.apiKey,
          prompt,
          providers.deepseek.model,
          historyByProvider?.deepseek ?? history
        )
          .then((res): [string, ProviderResult] => [
            "deepseek",
            { model: res.model, output: res.output, error: null },
          ])
          .catch((err): [string, ProviderResult] => [
            "deepseek",
            { model: providers.deepseek?.model ?? defaultModels.deepseek, output: null, error: errorMessage(err) },
          ])
      );
    }

    if (providers.gemini?.apiKey) {
      tasks.push(
        callGemini(
          providers.gemini.apiKey,
          prompt,
          providers.gemini.model,
          historyByProvider?.gemini ?? history,
          image
        )
          .then((res): [string, ProviderResult] => [
            "gemini",
            { model: res.model, output: res.output, error: null },
          ])
          .catch((err): [string, ProviderResult] => [
            "gemini",
            { model: providers.gemini?.model ?? defaultModels.gemini, output: null, error: errorMessage(err) },
          ])
      );
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No providers selected. Provide at least one API key." },
        { status: 400 }
      );
    }

    const entries = await Promise.all(tasks);
    const responses: Record<string, ProviderResult> = Object.fromEntries(entries);

    return NextResponse.json({ prompt, responses });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

const defaultModels = {
  openai: "gpt-4o-mini",
  zai: "glm-4-air", // ZhipuAI example
  deepseek: "deepseek-chat",
  gemini: "gemini-1.5-flash",
} as const;

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function toOpenAIMessages(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  prompt: string,
  image: { dataUrl: string; mimeType?: string } | null
) {
  const messages: OpenAIMessage[] = [
    { role: "system", content: "You are a helpful assistant." },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];
  if (image?.dataUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: image.dataUrl } },
      ],
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }
  return messages;
}

async function callOpenAI(
  apiKey: string,
  prompt: string,
  model?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  image: { dataUrl: string; mimeType?: string } | null = null
) {
  const usedModel = model || defaultModels.openai;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: usedModel,
      messages: toOpenAIMessages(history, prompt, image),
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as unknown as OpenAIChatResponse;
  const output: string = data?.choices?.[0]?.message?.content ?? "";
  return { model: usedModel, output };
}

function toOpenAIStyleMessages(history: Array<{ role: "user" | "assistant"; content: string }>, prompt: string) {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: prompt },
  ];
  return messages;
}

async function callZai(
  apiKey: string,
  prompt: string,
  model?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  const usedModel = model || defaultModels.zai;
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: usedModel,
      messages: toOpenAIStyleMessages(history, prompt),
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Z.ai error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as unknown as OpenAIStyleChatResponse;
  const output: string = data?.choices?.[0]?.message?.content ?? "";
  return { model: usedModel, output };
}

async function callDeepseek(
  apiKey: string,
  prompt: string,
  model?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  const usedModel = model || defaultModels.deepseek;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: usedModel,
      messages: toOpenAIStyleMessages(history, prompt),
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Deepseek error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as unknown as OpenAIStyleChatResponse;
  const output: string = data?.choices?.[0]?.message?.content ?? "";
  return { model: usedModel, output };
}

function parseDataUrl(dataUrl: string): { mimeType: string; dataBase64: string } | null {
  try {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) return null;
    return { mimeType: match[1] || "image/png", dataBase64: match[2] };
  } catch {
    return null;
  }
}

async function callGemini(
  apiKey: string,
  prompt: string,
  model?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  image: { dataUrl: string; mimeType?: string } | null = null
) {
  const usedModel = model || defaultModels.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    usedModel
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents: GeminiContent[] = [];
  for (const m of history) {
    contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] });
  }

  const parts: GeminiPart[] = [{ text: prompt }];
  if (image?.dataUrl) {
    const parsed = parseDataUrl(image.dataUrl);
    if (parsed) {
      parts.push({ inline_data: { mime_type: image.mimeType || parsed.mimeType, data: parsed.dataBase64 } });
    }
  }
  contents.push({ role: "user", parts });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.3 } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as unknown as GeminiResponse;
  const output: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { model: usedModel, output };
}


