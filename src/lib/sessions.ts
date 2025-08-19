"use client";

export type ProviderId = "openai" | "gemini" | "deepseek" | "zai";

export type ChatImage = { dataUrl: string; mimeType?: string };

export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    image?: ChatImage | null;
    createdAt: number;
};

export type ProviderThread = {
    providerId: ProviderId;
    model: string;
    messages: ChatMessage[];
};

export type ChatSession = {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    providers: ProviderId[];
    threads: Record<ProviderId, ProviderThread>;
    archived?: boolean;
};

const STORAGE_KEY = "mai:sessions";
const ACTIVE_ID_KEY = "mai:sessions:activeId";

export function loadSessions(): ChatSession[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as ChatSession[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveSessions(sessions: ChatSession[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getActiveSessionId(): string | null {
    return localStorage.getItem(ACTIVE_ID_KEY);
}

export function setActiveSessionId(id: string) {
    localStorage.setItem(ACTIVE_ID_KEY, id);
}

function generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createSession(enabledProviders: Array<{ id: ProviderId; model: string }>): ChatSession {
    const id = generateId();
    const now = Date.now();
    const threads: Record<ProviderId, ProviderThread> = {
        openai: { providerId: "openai", model: findModel("openai", enabledProviders), messages: [] },
        gemini: { providerId: "gemini", model: findModel("gemini", enabledProviders), messages: [] },
        deepseek: { providerId: "deepseek", model: findModel("deepseek", enabledProviders), messages: [] },
        zai: { providerId: "zai", model: findModel("zai", enabledProviders), messages: [] },
    } as const as Record<ProviderId, ProviderThread>;

    const providers = enabledProviders.map((p) => p.id);
    const session: ChatSession = {
        id,
        title: "New Chat",
        createdAt: now,
        updatedAt: now,
        providers,
        threads,
    };
    return session;
}

function findModel(id: ProviderId, list: Array<{ id: ProviderId; model: string }>): string {
    const f = list.find((p) => p.id === id);
    return f?.model ?? defaultModelFor(id);
}

export function defaultModelFor(id: ProviderId): string {
    switch (id) {
        case "openai":
            return process.env.NEXT_PUBLIC_DEFAULT_OPENAI_MODEL || "gpt-4o-mini";
        case "gemini":
            return process.env.NEXT_PUBLIC_DEFAULT_GEMINI_MODEL || "gemini-1.5-flash";
        case "deepseek":
            return "deepseek-chat";
        case "zai":
            return "glm-4-air";
    }
}

export function upsertSession(session: ChatSession) {
    const sessions = loadSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session; else sessions.unshift(session);
    saveSessions(sessions);
    setActiveSessionId(session.id);
}

export function getSessionById(id: string): ChatSession | null {
    const sessions = loadSessions();
    return sessions.find((s) => s.id === id) || null;
}

export function updateSessionTitle(session: ChatSession, prompt: string): ChatSession {
    if (session.title !== "New Chat") return session;
    const title = prompt.trim().slice(0, 40) + (prompt.trim().length > 40 ? "…" : "");
    return { ...session, title };
}

export function searchSessions(query: string): { session: ChatSession; score: number }[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const sessions = loadSessions();
    const results: { session: ChatSession; score: number }[] = [];
    for (const s of sessions) {
        let score = 0;
        for (const providerId of s.providers) {
            const thread = s.threads[providerId];
            for (const m of thread.messages) {
                if (m.content.toLowerCase().includes(q)) score += 1;
            }
        }
        if (score > 0) results.push({ session: s, score });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 50);
}


