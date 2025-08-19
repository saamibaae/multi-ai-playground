"use client";

export const AI_KEYS_STORAGE_KEY = "mai:api-keys";

export type ProviderKeys = {
    openai?: string;
    gemini?: string;
    deepseek?: string;
    zai?: string;
};

export function getSavedApiKeys(): ProviderKeys {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(AI_KEYS_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as unknown;
        if (typeof parsed !== "object" || parsed === null) return {};
        const keys = parsed as Record<string, unknown>;
        const result: ProviderKeys = {};
        for (const k of ["openai", "gemini", "deepseek", "zai"]) {
            const v = keys[k];
            if (typeof v === "string" && v.trim().length > 0) (result as any)[k] = v.trim();
        }
        return result;
    } catch {
        return {};
    }
}

export function hasAnyApiKey(): boolean {
    const keys = getSavedApiKeys();
    return Boolean(keys.openai || keys.gemini || keys.deepseek || keys.zai);
}


