"use client";

import React, { useMemo, useState } from "react";
import { getSavedApiKeys } from "@/lib/api-keys";
import { defaultModelFor } from "@/lib/sessions";

type ProviderId = "openai" | "gemini" | "deepseek" | "zai";

export type SidebarSelect = {
    providers: Array<{ id: ProviderId; model: string }>;
    onNewChat: () => void;
    onSearch: (q: string) => void;
    onOpenSession: (id: string) => void;
    sessions: Array<{ id: string; title: string; updatedAt: number }>; // provided from parent
};

export function Sidebar({ providers, onNewChat, onSearch, onOpenSession, sessions }: SidebarSelect) {
    const [query, setQuery] = useState("");

    const enabled = useMemo(() => {
        const local = getSavedApiKeys();
        const list: ProviderId[] = [];
        if (local.openai) list.push("openai");
        if (local.gemini) list.push("gemini");
        if (local.deepseek) list.push("deepseek");
        if (local.zai) list.push("zai");
        return list;
    }, []);

    const derived = useMemo(() => {
        const set = new Set(enabled);
        return Array.from(set).map((id) => ({ id, model: defaultModelFor(id) }));
    }, [enabled]);

    return (
        <aside style={{ width: 280, borderRight: "1px solid #e5e7eb", padding: 12, display: "grid", gridTemplateRows: "auto auto 1fr" }}>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onNewChat} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#111827", color: "white", border: "1px solid #111827" }}>New Chat</button>
            </div>
            <div style={{ marginTop: 10 }}>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onSearch(e.target.value);
                    }}
                    placeholder="Search chats"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
            </div>
            <div style={{ overflow: "auto", marginTop: 10, display: "grid", gap: 6 }}>
                {sessions.length === 0 ? (
                    <div style={{ color: "#6b7280" }}>No chats yet</div>
                ) : (
                    sessions.map((s) => (
                        <button key={s.id} onClick={() => onOpenSession(s.id)} style={{ textAlign: "left", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", background: "white" }}>
                            <div style={{ fontWeight: 600 }}>{s.title || "Untitled"}</div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>{new Date(s.updatedAt).toLocaleString()}</div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}


