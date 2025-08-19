"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadChatsLocal, subscribeChatsFirestore } from "@/lib/persistence";
import { useAuth } from "@/hooks/useAuth";

type ProviderKey = "openai" | "gemini" | "deepseek" | "zai";

export function SidebarNav({ onNewChat, onCollapseAll }: {
    onNewChat?: () => void;
    onCollapseAll?: () => void;
}) {
    const [keys, setKeys] = useState<Partial<Record<ProviderKey, string>>>({});
    const [search, setSearch] = useState("");
    const [archives, setArchives] = useState(() => loadChatsLocal());
    const { user } = useAuth();
    useEffect(() => {
        try {
            const raw = localStorage.getItem("multi-ai-keys");
            if (raw) setKeys(JSON.parse(raw));
        } catch { }
    }, []);
    useEffect(() => {
        if (!user?.uid) return;
        try {
            const unsub = subscribeChatsFirestore(user.uid, (list) => {
                const merged = [...list, ...loadChatsLocal()];
                const seen = new Set<string>();
                const uniq = merged.filter((c) => {
                    const key = `${c.title}|${c.messages.length}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setArchives(uniq);
            });
            return () => unsub();
        } catch (e) {
            console.warn("Firestore subscribe failed:", e);
        }
    }, [user?.uid]);
    const providers = useMemo(() => Object.keys(keys).filter((k) => Boolean((keys as Partial<Record<string, string>>)[k])) as ProviderKey[], [keys]);
    const filteredArchives = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return archives;
        return archives.filter((a) => a.title.toLowerCase().includes(q));
    }, [archives, search]);

    return (
        <aside className="hidden md:flex w-72 flex-col border-r border-black/10 dark:border-white/10 p-3 gap-3">
            <div className="flex items-center justify-between">
                <Link href="/" className="font-semibold">Multi‑AI</Link>
                <ThemeToggle />
            </div>
            <div className="card p-3">
                <div className="text-xs mb-2 opacity-70">Providers</div>
                <div className="flex flex-col gap-2">
                    {providers.length === 0 && <div className="text-sm opacity-60">No keys</div>}
                    {providers.map((p) => (
                        <div key={p} className="flex items-center justify-between">
                            <span className="capitalize">{p}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-2">
                <Button variant="outline" onClick={onNewChat}>New Chat</Button>
                <Button variant="outline" onClick={onCollapseAll}>Collapse All</Button>
                <Link className="rounded-full border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-center" href="/api-setup">API Setup</Link>
            </div>
            <div className="card p-3 space-y-2">
                <div className="text-xs opacity-70">Search Chats</div>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                <div className="text-xs opacity-70">Previous Chats</div>
                <ScrollArea className="h-48">
                    <div className="flex flex-col gap-2 pr-2">
                        {filteredArchives.length === 0 && <div className="text-sm opacity-60">No history</div>}
                        {filteredArchives.map((a, idx) => (
                            <button key={idx} className="text-left text-sm rounded-md hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1">
                                {a.title}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </aside>
    );
}


