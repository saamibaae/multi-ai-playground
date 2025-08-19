"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSavedApiKeys, AI_KEYS_STORAGE_KEY } from "@/lib/api-keys";
import { useAuth } from "@/contexts/AuthContext";
import { encryptString, type EncryptedString } from "@/lib/crypto";
import { fetchSyncedKeys, upsertSyncedKeys, type SyncedProviderKeys } from "@/lib/key-sync";
import { useRouter } from "next/navigation";

type ProviderId = "openai" | "gemini" | "deepseek" | "zai";

type ProviderConfig = {
    id: ProviderId;
    name: string;
    howto: string;
    link: string;
    placeholder: string;
    validator: (value: string) => string | null; // returns error or null
};

const PROVIDERS: ProviderConfig[] = [
    {
        id: "openai",
        name: "OpenAI",
        howto: "Create an API key in your OpenAI dashboard.",
        link: "https://platform.openai.com/api-keys",
        placeholder: "sk-...",
        validator: (v) => (v.trim().startsWith("sk-") && v.trim().length >= 20 ? null : "OpenAI keys usually start with sk-")
    },
    {
        id: "gemini",
        name: "Gemini",
        howto: "Generate a key from Google AI Studio.",
        link: "https://aistudio.google.com/app/apikey",
        placeholder: "AIza...",
        validator: (v) => (v.trim().length >= 20 ? null : "Enter your Gemini API key")
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        howto: "Create an API key from your DeepSeek account.",
        link: "https://platform.deepseek.com/",
        placeholder: "ds-...",
        validator: (v) => (v.trim().length >= 16 ? null : "Enter your DeepSeek API key")
    },
    {
        id: "zai",
        name: "GLM (ZhipuAI)",
        howto: "Create an API key in ZhipuAI console.",
        link: "https://open.bigmodel.cn/dev/api",
        placeholder: "",
        validator: (v) => (v.trim().length >= 16 ? null : "Enter your ZhipuAI API key")
    }
];

type ProviderState = {
    collapsed: boolean;
    input: string;
    error: string | null;
    saved: boolean;
    synced: boolean;
};

export default function ApiSetupPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [syncEnabled, setSyncEnabled] = useState<boolean>(false);
    const [passphrase, setPassphrase] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [states, setStates] = useState<Record<ProviderId, ProviderState>>(() => {
        const initial: Record<ProviderId, ProviderState> = {
            openai: { collapsed: false, input: "", error: null, saved: false, synced: false },
            gemini: { collapsed: true, input: "", error: null, saved: false, synced: false },
            deepseek: { collapsed: true, input: "", error: null, saved: false, synced: false },
            zai: { collapsed: true, input: "", error: null, saved: false, synced: false },
        } as const;
        return initial;
    });

    const anyValid = useMemo(() => Object.values(states).some((s) => s.saved && !s.error && s.input.trim().length > 0), [states]);

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

    // hydrate from localStorage
    useEffect(() => {
        const local = getSavedApiKeys();
        setStates((prev) => {
            const next = { ...prev };
            (Object.keys(local) as ProviderId[]).forEach((id) => {
                const v = (local as any)[id] as string;
                if (!v) return;
                next[id] = {
                    ...next[id],
                    input: maskKey(v),
                    saved: true,
                };
            });
            return next;
        });
    }, []);

    // hydrate synced markers
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!user) return;
            const remote = await fetchSyncedKeys(user.uid);
            if (!mounted || !remote) return;
            setStates((prev) => {
                const next = { ...prev };
                (Object.keys(remote) as ProviderId[]).forEach((id) => {
                    next[id] = { ...next[id], synced: true };
                });
                return next;
            });
        })();
        return () => {
            mounted = false;
        };
    }, [user]);

    function maskKey(value: string): string {
        if (value.length <= 8) return "••••";
        return `${value.slice(0, 4)}••••${value.slice(-4)}`;
    }

    function setLocalKey(id: ProviderId, value: string) {
        const current = getSavedApiKeys();
        (current as any)[id] = value;
        localStorage.setItem(AI_KEYS_STORAGE_KEY, JSON.stringify(current));
    }

    async function saveProvider(id: ProviderId) {
        const cfg = PROVIDERS.find((p) => p.id === id)!;
        const s = states[id];
        const err = cfg.validator(s.input);
        setStates((prev) => ({ ...prev, [id]: { ...s, error: err } }));
        if (err) return;
        setLocalKey(id, s.input.trim());
        setStates((prev) => ({ ...prev, [id]: { ...prev[id], saved: true } }));
        toast("Saved");
    }

    function toast(text: string) {
        const n = document.createElement("div");
        n.textContent = text;
        Object.assign(n.style, {
            position: "fixed",
            bottom: "16px",
            right: "16px",
            background: "#111827",
            color: "white",
            padding: "10px 14px",
            borderRadius: "8px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            zIndex: 100,
            opacity: "0",
        } as CSSStyleDeclaration);
        document.body.appendChild(n);
        (n as HTMLElement).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: "forwards" });
        setTimeout(() => {
            (n as HTMLElement).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" }).finished.then(() => n.remove());
        }, 1200);
    }

    async function syncAll() {
        if (!user) {
            alert("You must be signed in to sync.");
            return;
        }
        if (!passphrase) {
            alert("Enter a passphrase to encrypt your keys before syncing.");
            return;
        }
        try {
            setSaving(true);
            const local = getSavedApiKeys();
            const payload: SyncedProviderKeys = {};
            for (const id of ["openai", "gemini", "deepseek", "zai"] as ProviderId[]) {
                const value = (local as any)[id] as string | undefined;
                if (value && value.trim().length > 0) {
                    const enc: EncryptedString = await encryptString(value.trim(), passphrase);
                    (payload as any)[id] = enc;
                }
            }
            await upsertSyncedKeys(user.uid, payload);
            setStates((prev) => {
                const next = { ...prev };
                (Object.keys(payload) as ProviderId[]).forEach((id) => (next[id] = { ...next[id], synced: true }));
                return next;
            });
            toast("Synced");
        } finally {
            setSaving(false);
        }
    }

    function ProviderCard({ cfg }: { cfg: ProviderConfig }) {
        const s = states[cfg.id];
        return (
            <section
                style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    background: "white",
                    overflow: "hidden",
                    transition: "box-shadow .2s ease",
                }}
            >
                <button
                    onClick={() => setStates((prev) => ({ ...prev, [cfg.id]: { ...prev[cfg.id], collapsed: !prev[cfg.id].collapsed } }))}
                    style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: 16,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        outline: "none",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <strong>{cfg.name}</strong>
                        {s.synced ? (
                            <span style={{ fontSize: 12, background: "#ecfeff", color: "#0369a1", padding: "2px 6px", borderRadius: 999 }}>Synced</span>
                        ) : null}
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: s.collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform .2s ease" }}><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <div
                    style={{
                        height: s.collapsed ? 0 : "auto",
                        padding: s.collapsed ? "0 16px" : "0 16px 16px 16px",
                        overflow: "hidden",
                        transition: "all .2s ease",
                    }}
                >
                    <p style={{ color: "#6b7280", marginBottom: 12 }}>{cfg.howto} <a href={cfg.link} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Get key</a></p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="password"
                            inputMode="text"
                            placeholder={cfg.placeholder}
                            aria-label={`${cfg.name} API key`}
                            value={s.input}
                            onChange={(e) => setStates((prev) => ({ ...prev, [cfg.id]: { ...prev[cfg.id], input: e.target.value, saved: false } }))}
                            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" }}
                        />
                        <button onClick={() => saveProvider(cfg.id)} style={{ padding: "10px 14px", borderRadius: 10, background: "#111827", color: "white", border: "1px solid #111827" }}>
                            {s.saved ? "Saved ✓" : "Save"}
                        </button>
                    </div>
                    {s.error ? <div role="alert" style={{ marginTop: 8, color: "#b91c1c", fontSize: 13 }}>{s.error}</div> : null}
                </div>
            </section>
        );
    }

    const canContinue = useMemo(() => {
        const local = getSavedApiKeys();
        return Boolean(local.openai || local.gemini || local.deepseek || local.zai);
    }, [states]);

    return (
        <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>API Setup</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {PROVIDERS.map((cfg) => (
                    <ProviderCard key={cfg.id} cfg={cfg} />
                ))}
            </div>

            <section style={{ marginTop: 20, border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <input
                        id="sync-enabled"
                        type="checkbox"
                        checked={syncEnabled}
                        onChange={(e) => setSyncEnabled(e.target.checked)}
                    />
                    <label htmlFor="sync-enabled" style={{ fontWeight: 600 }}>Sync encrypted keys to your account (Firestore)</label>
                </div>
                {syncEnabled ? (
                    <div style={{ display: "grid", gap: 8 }}>
                        <input
                            type="password"
                            placeholder="Encryption passphrase"
                            aria-label="Encryption passphrase"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" }}
                        />
                        <button onClick={syncAll} disabled={saving} style={{ alignSelf: "start", padding: "10px 14px", borderRadius: 10, background: "#111827", color: "white", border: "1px solid #111827", opacity: saving ? 0.7 : 1 }}>
                            {saving ? "Syncing..." : "Sync Now"}
                        </button>
                        <small style={{ color: "#6b7280" }}>Keys are AES-GCM encrypted client-side with your passphrase before upload. Passphrase is not stored.</small>
                    </div>
                ) : (
                    <small style={{ color: "#6b7280" }}>Keys are stored locally only and never sent to the server.</small>
                )}
            </section>

            <div style={{ position: "sticky", bottom: 12, display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                    onClick={() => router.push("/chat")}
                    disabled={!canContinue}
                    title={!canContinue ? "Add at least one API key to continue" : undefined}
                    style={{
                        padding: "12px 18px",
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        background: canContinue ? "#111827" : "#f3f4f6",
                        color: canContinue ? "white" : "#9ca3af",
                        fontWeight: 700,
                        cursor: canContinue ? "pointer" : "not-allowed",
                    }}
                >
                    Continue →
                </button>
            </div>
        </main>
    );
}


