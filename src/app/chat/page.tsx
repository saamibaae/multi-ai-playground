"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ResizableColumns } from "@/components/ResizableColumns";
import { TypingDots } from "@/components/TypingDots";
import { getSavedApiKeys } from "@/lib/api-keys";
import { ChatMessage, ChatSession, createSession, defaultModelFor, getActiveSessionId, getSessionById, loadSessions, setActiveSessionId, upsertSession, updateSessionTitle, ProviderId } from "@/lib/sessions";

type ProviderInfo = { id: ProviderId; name: string; color: string; supportsImages: boolean };
const PROVIDERS: Record<ProviderId, ProviderInfo> = {
    openai: { id: "openai", name: "OpenAI", color: "#2563eb", supportsImages: true },
    gemini: { id: "gemini", name: "Gemini", color: "#059669", supportsImages: true },
    deepseek: { id: "deepseek", name: "DeepSeek", color: "#d97706", supportsImages: false },
    zai: { id: "zai", name: "GLM", color: "#7c3aed", supportsImages: false },
};

export default function ChatPage() {
    useEffect(() => {
        const el = document.querySelector("main");
        if (el) {
            (el as HTMLElement).animate(
                [
                    { opacity: 0, transform: "translateY(8px)" },
                    { opacity: 1, transform: "translateY(0px)" },
                ],
                { duration: 200, easing: "ease" }
            );
        }
    }, []);

    const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
    const [activeId, setActiveId] = useState<string | null>(() => getActiveSessionId());

    const enabledProviders = useMemo(() => {
        const local = getSavedApiKeys();
        const list: { id: ProviderId; model: string }[] = [];
        if (local.openai) list.push({ id: "openai", model: defaultModelFor("openai") });
        if (local.gemini) list.push({ id: "gemini", model: defaultModelFor("gemini") });
        if (local.deepseek) list.push({ id: "deepseek", model: defaultModelFor("deepseek") });
        if (local.zai) list.push({ id: "zai", model: defaultModelFor("zai") });
        return list;
    }, []);

    const activeSession = useMemo(() => {
        if (activeId) return getSessionById(activeId);
        return null;
    }, [activeId, sessions]);

    useEffect(() => {
        if (!activeSession && enabledProviders.length > 0) {
            const s = createSession(enabledProviders);
            upsertSession(s);
            setSessions(loadSessions());
            setActiveId(s.id);
        }
    }, [activeSession, enabledProviders]);

    function handleNewChat() {
        const s = createSession(enabledProviders);
        upsertSession(s);
        setSessions(loadSessions());
        setActiveId(s.id);
    }

    function handleOpenSession(id: string) {
        setActiveId(id);
        setActiveSessionId(id);
    }

    function handleSearch(_q: string) {
        // search handled in parent if needed; placeholder for now
    }

    const sidebarSessions = useMemo(() => sessions.map((s) => ({ id: s.id, title: s.title, updatedAt: s.updatedAt })), [sessions]);

    if (!activeSession) {
        return (
            <main style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100svh - 56px)" }}>
                <Sidebar providers={enabledProviders} onNewChat={handleNewChat} onSearch={handleSearch} onOpenSession={handleOpenSession} sessions={sidebarSessions} />
                <div style={{ display: "grid", placeItems: "center" }}>No providers enabled. Add keys in API Setup.</div>
            </main>
        );
    }

    return (
        <ChatUI
            sessions={sessions}
            setSessions={setSessions}
            activeSession={activeSession}
            setActiveSessionId={(id) => {
                setActiveId(id);
                setActiveSessionId(id);
            }}
            enabledProviders={enabledProviders}
            onNewChat={handleNewChat}
            onOpenSession={handleOpenSession}
            onSearch={handleSearch}
        />
    );
}

function ChatUI({ sessions, setSessions, activeSession, setActiveSessionId, enabledProviders, onNewChat, onOpenSession, onSearch }: {
    sessions: ChatSession[];
    setSessions: (s: ChatSession[]) => void;
    activeSession: ChatSession;
    setActiveSessionId: (id: string) => void;
    enabledProviders: Array<{ id: ProviderId; model: string }>;
    onNewChat: () => void;
    onOpenSession: (id: string) => void;
    onSearch: (q: string) => void;
}) {
    const [input, setInput] = useState("");
    const [image, setImage] = useState<{ dataUrl: string; mimeType?: string } | null>(null);
    const [loading, setLoading] = useState<Record<ProviderId, boolean>>({ openai: false, gemini: false, deepseek: false, zai: false });
    const scrollRefs = useRef<Record<ProviderId, HTMLDivElement | null>>({ openai: null, gemini: null, deepseek: null, zai: null });

    const columns = enabledProviders.map((p) => p.id);

    function setSession(next: ChatSession) {
        upsertSession(next);
        setSessions(loadSessions());
    }

    function handleDrop(ev: React.DragEvent<HTMLTextAreaElement>) {
        ev.preventDefault();
        const file = ev.dataTransfer.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImage({ dataUrl: String(reader.result), mimeType: file.type || "image/png" });
        reader.readAsDataURL(file);
    }

    function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImage({ dataUrl: String(reader.result), mimeType: file.type || "image/png" });
        reader.readAsDataURL(file);
    }

    async function send() {
        const prompt = input.trim();
        if (!prompt) return;
        const now = Date.now();
        let session = { ...activeSession, updatedAt: now };
        session = updateSessionTitle(session, prompt);

        for (const pid of columns) {
            const thread = session.threads[pid];
            thread.messages = [...thread.messages, { role: "user", content: prompt, image: PROVIDERS[pid].supportsImages ? image : null, createdAt: now }];
        }

        setSession(session);
        setInput("");
        setImage(null);
        const controller = new AbortController();

        const requests = columns.map(async (pid) => {
            setLoading((l) => ({ ...l, [pid]: true }));
            try {
                const res = await fetch("/api/multi-chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        prompt,
                        providers: providerPayloadFromLocal(),
                        historyByProvider: buildHistoryByProvider(session),
                        image: image && PROVIDERS[pid].supportsImages ? image : null,
                    }),
                });
                const data = await res.json();
                const output = data?.responses?.[pid]?.output || data?.responses?.[pid]?.error || "";
                session = { ...session };
                session.threads[pid] = { ...session.threads[pid], messages: [...session.threads[pid].messages, { role: "assistant", content: output, createdAt: Date.now() } as ChatMessage] };
                setSession(session);
                scrollToBottom(pid);
            } catch (err) {
                session = { ...session };
                session.threads[pid] = { ...session.threads[pid], messages: [...session.threads[pid].messages, { role: "assistant", content: String(err), createdAt: Date.now() } as ChatMessage] };
                setSession(session);
            } finally {
                setLoading((l) => ({ ...l, [pid]: false }));
            }
        });
        await Promise.allSettled(requests);
    }

    function providerPayloadFromLocal() {
        const local = getSavedApiKeys();
        const providers: any = {};
        if (local.openai) providers.openai = { apiKey: local.openai, model: defaultModelFor("openai") };
        if (local.gemini) providers.gemini = { apiKey: local.gemini, model: defaultModelFor("gemini") };
        if (local.deepseek) providers.deepseek = { apiKey: local.deepseek, model: defaultModelFor("deepseek") };
        if (local.zai) providers.zai = { apiKey: local.zai, model: defaultModelFor("zai") };
        return providers;
    }

    function buildHistoryByProvider(session: ChatSession) {
        const map: any = {};
        for (const pid of columns) {
            const messages = session.threads[pid].messages.map((m) => ({ role: m.role, content: m.content }));
            map[pid] = messages;
        }
        return map;
    }

    function scrollToBottom(pid: ProviderId) {
        const target = scrollRefs.current[pid];
        if (target) target.scrollTo({ top: target.scrollHeight, behavior: "smooth" });
    }

    const columnNodes = columns.map((pid) => (
        <Column key={pid} pid={pid} session={activeSession} loading={loading[pid]} scrollRef={(el) => (scrollRefs.current[pid] = el)} />
    ));

    return (
        <main style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100svh - 56px)" }}>
            <Sidebar providers={enabledProviders} onNewChat={onNewChat} onSearch={onSearch} onOpenSession={onOpenSession} sessions={sessions.map((s) => ({ id: s.id, title: s.title, updatedAt: s.updatedAt }))} />
            <div style={{ display: "grid", gridTemplateRows: "1fr auto", height: "100%" }}>
                <div style={{ padding: 12, overflow: "hidden" }}>
                    <ResizableColumns>
                        {columnNodes}
                    </ResizableColumns>
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", padding: 12, display: "flex", gap: 8, alignItems: "flex-end", position: "sticky", bottom: 0, background: "white" }}>
                    <textarea
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={2}
                        style={{ flex: 1, resize: "none", padding: 12, border: "1px solid #e5e7eb", borderRadius: 12 }}
                    />
                    <label style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, background: "white", cursor: "pointer" }}>
                        Attach
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFilePick} />
                    </label>
                    <button onClick={send} style={{ padding: "12px 16px", borderRadius: 12, background: "#111827", color: "white", border: "1px solid #111827", fontWeight: 700 }}>Send</button>
                </div>
            </div>
        </main>
    );
}

function Column({ pid, session, loading, scrollRef }: { pid: ProviderId; session: ChatSession; loading: boolean; scrollRef: (el: HTMLDivElement | null) => void }) {
    const info = PROVIDERS[pid];
    const thread = session.threads[pid];
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const el = document.getElementById(`col-scroll-${pid}`);
        if (el) scrollRef(el as HTMLDivElement);
    }, [pid, scrollRef]);

    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: 0, border: "1px solid #e5e7eb", borderRadius: 12, background: "white" }}>
            <header style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 8, borderBottom: "1px solid #e5e7eb", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: info.color }} />
                    <strong>{info.name}</strong>
                </div>
                <button onClick={() => setCollapsed((c) => !c)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white" }}>{collapsed ? "Expand" : "Collapse"}</button>
            </header>
            <div id={`col-scroll-${pid}`} style={{ overflow: "auto", padding: 12, display: collapsed ? "none" : "block" }}>
                {thread.messages.map((m, idx) => (
                    <div key={idx} style={{ marginBottom: 10, display: "grid", justifyContent: m.role === "user" ? "end" : "start" }}>
                        <div style={{ maxWidth: 540, padding: 10, borderRadius: 12, background: m.role === "user" ? "#111827" : "#f3f4f6", color: m.role === "user" ? "white" : "#111827", animation: "msg .18s ease both" }}>
                            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                            {m.image ? (
                                <img src={m.image.dataUrl} alt="attachment" style={{ display: "block", maxWidth: "100%", height: "auto", marginTop: 8, borderRadius: 8 }} loading="lazy" />
                            ) : null}
                        </div>
                    </div>
                ))}
                {loading ? (
                    <div style={{ marginTop: 8 }}><TypingDots /></div>
                ) : null}
                <style>{`@keyframes msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
            </div>
        </div>
    );
}


