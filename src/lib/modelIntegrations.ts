export type ModelCapability = {
  provider: "openai" | "gemini" | "deepseek" | "zai";
  name: string;
  supportsImages: boolean;
  defaultModel: string;
  color: string;
};

export const MODEL_CAPABILITIES: ModelCapability[] = [
  { provider: "openai", name: "OpenAI", supportsImages: true, defaultModel: process.env.NEXT_PUBLIC_DEFAULT_OPENAI_MODEL || "gpt-4o-mini", color: "#2563eb" },
  { provider: "gemini", name: "Gemini", supportsImages: true, defaultModel: process.env.NEXT_PUBLIC_DEFAULT_GEMINI_MODEL || "gemini-1.5-flash", color: "#16a34a" },
  { provider: "deepseek", name: "DeepSeek", supportsImages: false, defaultModel: "deepseek-chat", color: "#a855f7" },
  { provider: "zai", name: "GLM", supportsImages: false, defaultModel: "glm-4-air", color: "#f59e0b" },
];


