"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useAPIKeys } from "@/contexts/APIKeyContext";
import { defaultModelFor, type ChatSession, type ProviderId, upsertSession, loadSessions, updateSessionTitle } from "@/lib/sessions";
import { registry, type ProviderHandler } from "@/integrations/providers";

type ChatContextValue = {
  session: ChatSession | null;
  setSession: (s: ChatSession | null) => void;
  sendPrompt: (prompt: string, image?: { dataUrl: string; mimeType?: string } | null) => Promise<void>;
  loading: Partial<Record<ProviderId, boolean>>;
  errors: Partial<Record<ProviderId, string | null>>;
  autoRetry: boolean;
  setAutoRetry: (v: boolean) => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

export function ChatProvider({ initialSession, children }: { initialSession: ChatSession | null; children: React.ReactNode }) {
  const { keys, enabledProviders } = useAPIKeys();
  const [session, setSession] = useState<ChatSession | null>(initialSession);
  const [loading, setLoading] = useState<Partial<Record<ProviderId, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<ProviderId, string | null>>>({});
  const [autoRetry, setAutoRetry] = useState<boolean>(true);
  const abortRef = useRef<AbortController | null>(null);

  const providerList = useMemo(() => enabledProviders as ProviderId[], [enabledProviders]);

  const ensureSession = useCallback(() => {
    if (session) return session;
    const now = Date.now();
    const id = Math.random().toString(36).slice(2) + now.toString(36);
    const threads: any = {};
    for (const pid of providerList) threads[pid] = { providerId: pid, model: defaultModelFor(pid), messages: [] };
    const created = { id, title: "New Chat", createdAt: now, updatedAt: now, providers: providerList, threads } as ChatSession;
    upsertSession(created);
    setSession(created);
    return created;
  }, [session, providerList]);

  const sendPrompt = useCallback(async (prompt: string, image?: { dataUrl: string; mimeType?: string } | null) => {
    const s = ensureSession();
    const now = Date.now();
    let working = updateSessionTitle({ ...s, updatedAt: now }, prompt);
    // append user message per provider
    for (const pid of providerList) {
      const supportsImages = pid === "openai" || pid === "gemini";
      working.threads[pid].messages = [
        ...working.threads[pid].messages,
        { role: "user", content: prompt, image: supportsImages ? image ?? null : null, createdAt: now },
      ];
    }
    upsertSession(working);
    setSession(working);

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const tasks = providerList.map(async (pid) => {
      const handler: ProviderHandler = registry[pid] ?? registry.openai!;
      const apiKey = (keys as any)[pid] as string | undefined;
      if (!apiKey) return;
      setLoading((l) => ({ ...l, [pid]: true }));
      setErrors((e) => ({ ...e, [pid]: null }));
      try {
        const history = working.threads[pid].messages.map((m) => ({ role: m.role, content: m.content }));
        const gen = handler({ provider: pid, model: working.threads[pid].model, apiKey, prompt, history, image: image ?? null }, signal);
        let aggregated = "";
        for await (const chunk of gen) {
          if (chunk.type === "token") {
            aggregated += chunk.text;
          } else if (chunk.type === "final") {
            aggregated = chunk.text;
          } else if (chunk.type === "error") {
            setErrors((e) => ({ ...e, [pid]: chunk.error }));
          }
        }
        working = { ...working };
        working.threads[pid] = { ...working.threads[pid], messages: [...working.threads[pid].messages, { role: "assistant", content: aggregated, createdAt: Date.now() }] };
        upsertSession(working);
        setSession(working);
      } catch (err) {
        setErrors((e) => ({ ...e, [pid]: (err as Error).message }));
      } finally {
        setLoading((l) => ({ ...l, [pid]: false }));
      }
    });

    await Promise.allSettled(tasks);
    setSession(loadSessions().find((x) => x.id === working.id) || working);
  }, [ensureSession, providerList, keys]);

  const value: ChatContextValue = useMemo(() => ({ session, setSession, sendPrompt, loading, errors, autoRetry, setAutoRetry }), [session, sendPrompt, loading, errors, autoRetry]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}


