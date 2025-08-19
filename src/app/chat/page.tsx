"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { SidebarNav } from "@/components/SidebarNav";
import { saveChatLocal, loadChatsLocal, saveChatFirestore } from "@/lib/persistence";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import useEmblaCarousel from "embla-carousel-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ProviderKey = "openai" | "gemini" | "deepseek" | "zai";
type Message = { id: string; role: "user" | "assistant"; content: string; imageDataUrl?: string | null };

function useStoredKeys() {
  const [keys, setKeys] = useState<Partial<Record<ProviderKey, string>>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("multi-ai-keys");
      if (raw) setKeys(JSON.parse(raw));
    } catch { }
  }, []);
  return keys;
}

export default function ChatPlaygroundPage() {
  const keys = useStoredKeys();
  const providers = useMemo(() => Object.entries(keys).filter(([, v]) => !!v) as Array<[ProviderKey, string]>, [keys]);
  const [historyByProvider, setHistoryByProvider] = useState<Partial<Record<ProviderKey, Message[]>>>({});
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [collapsed, setCollapsed] = useState<Partial<Record<ProviderKey, boolean>>>({});
  const [archives, setArchives] = useState(() => loadChatsLocal());
  const [searchByProvider, setSearchByProvider] = useState<Partial<Record<ProviderKey, string>>>({});
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRefs = useRef<Partial<Record<ProviderKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    // Ensure provider keys exist
    setHistoryByProvider((h) => {
      const next = { ...h } as Partial<Record<ProviderKey, Message[]>>;
      for (const [p] of providers) {
        if (!next[p]) next[p] = [];
      }
      return next;
    });
  }, [providers]);

  useEffect(() => {
    // Auto-scroll each column to bottom when messages change
    for (const [p] of providers) {
      const el = scrollRefs.current[p];
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [historyByProvider, isSending, providers]);

  async function send() {
    if (!input.trim() && !image) return;
    setIsSending(true);
    const prompt = input.trim();
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: prompt, imageDataUrl: image };
    const nextHistory = { ...historyByProvider };
    for (const [p] of providers) {
      nextHistory[p] = [...(nextHistory[p] || []), userMessage];
    }
    setHistoryByProvider(nextHistory);
    setInput("");
    setImage(null);

    const payloadHistories: Record<string, Array<{ role: "user" | "assistant"; content: string }>> = {};
    for (const [p] of providers) {
      payloadHistories[p] = (nextHistory[p] || []).map((m) => ({ role: m.role, content: m.content }));
    }

    const body = {
      prompt,
      providers: {
        openai: keys.openai ? { apiKey: keys.openai } : undefined,
        gemini: keys.gemini ? { apiKey: keys.gemini } : undefined,
        deepseek: keys.deepseek ? { apiKey: keys.deepseek } : undefined,
        zai: keys.zai ? { apiKey: keys.zai } : undefined,
      },
      historyByProvider: payloadHistories,
      image: userMessage.imageDataUrl ? { dataUrl: userMessage.imageDataUrl } : null,
    };

    try {
      const res = await fetch("/api/multi-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data?.responses) {
        const nh = { ...nextHistory };
        Object.entries(data.responses as Record<string, { model: string; output: string | null; error: string | null }>).
          forEach(([key, r]) => {
            const provider = key as ProviderKey;
            const text = r.error ? `Error: ${r.error}` : (r.output || "");
            nh[provider] = [...(nh[provider] || []), { id: crypto.randomUUID(), role: "assistant", content: text }];
          });
        setHistoryByProvider(nh);
        // Save a simple archive snapshot (local)
        const merged = providers.flatMap(([p]) => nh[p] || []);
        if (merged.length > 0) {
          const record = { title: prompt.slice(0, 50) || "New chat", messages: merged.map(m => ({ role: m.role, content: m.content })) };
          await saveChatLocal(record);
          if (user?.uid) {
            await saveChatFirestore(user.uid, record);
          }
          setArchives(loadChatsLocal());
        }
      }
    } catch (e) {
      const nh = { ...nextHistory };
      for (const [p] of providers) {
        nh[p] = [...(nh[p] || []), { id: crypto.randomUUID(), role: "assistant", content: `Request failed: ${String(e)}` }];
      }
      setHistoryByProvider(nh);
    } finally {
      setIsSending(false);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <main className="flex h-dvh">
      <SidebarNav
        onNewChat={() => setHistoryByProvider({})}
        onCollapseAll={() => setCollapsed(Object.fromEntries(providers.map(([p]) => [p, true])) as Partial<Record<ProviderKey, boolean>>)}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <div className="md:hidden">
            {/* Mobile: swipeable */}
            <CarouselColumns providers={providers} historyByProvider={historyByProvider} isSending={isSending} collapsed={collapsed} />
          </div>
          <div className="hidden md:block">
            {/* Desktop: resizable */}
            <PanelGroup direction="horizontal">
              {providers.map(([provider], idx) => (
                <div className="contents" key={provider}>
                  {idx > 0 && <PanelResizeHandle className="w-1 bg-transparent" />}
                  <Panel defaultSize={100 / Math.max(1, providers.length)} minSize={20}>
                    <div className="pr-4">
                      <div className="card p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium capitalize">{provider}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setHistoryByProvider((h) => ({ ...h, [provider]: [] }))}>New</Button>
                            <Button variant="outline" size="sm" onClick={() => setCollapsed((c) => ({ ...c, [provider]: !c[provider] }))}>{collapsed[provider] ? "Expand" : "Collapse"}</Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Previous</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {archives.length === 0 && <div className="px-2 py-1 text-sm opacity-60">No history</div>}
                                {archives.slice(0, 10).map((a, i) => (
                                  <DropdownMenuItem key={i} onClick={() => setHistoryByProvider((h) => ({
                                    ...h,
                                    [provider]: a.messages.map((m) => ({ id: crypto.randomUUID(), role: m.role, content: m.content }))
                                  }))}>
                                    {a.title}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={searchByProvider[provider] || ""}
                            onChange={(e) => setSearchByProvider((s) => ({ ...s, [provider]: e.target.value }))}
                            placeholder="Search in chat..."
                          />
                        </div>
                        <div
                          ref={(el) => { scrollRefs.current[provider] = el; }}
                          className={`flex-1 min-h-0 overflow-y-auto pr-1 ${collapsed[provider] ? "hidden" : "flex"} flex-col justify-end space-y-2 pb-28`}
                        >
                          {((historyByProvider[provider] || []).filter((m) => {
                            const q = (searchByProvider[provider] || "").trim().toLowerCase();
                            return !q || m.content.toLowerCase().includes(q);
                          }))
                            .map((m) => (
                              <div key={m.id} className={`animate-fadeIn w-full ${m.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[90%]"}`}>
                                <div className={`rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                                  {m.imageDataUrl && (
                                    <Image src={m.imageDataUrl} alt="uploaded image" width={512} height={512} className="mb-2 h-auto w-auto max-h-48 rounded-lg" />
                                  )}
                                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                                </div>
                              </div>
                            ))}
                          {isSending && (
                            <div className="mr-auto max-w-[60%] rounded-2xl bg-black/5 dark:bg-white/10 px-4 py-2">
                              <span className="inline-flex gap-1">
                                <span className="h-2 w-2 rounded-full bg-current animate-typing" />
                                <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:150ms]" />
                                <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:300ms]" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Panel>
                </div>
              ))}
            </PanelGroup>
          </div>
        </div>


        {/* Floating prompt bar */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="fixed z-50 inset-x-3 bottom-3 md:left-72 md:right-6"
        >
          <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur p-2 shadow-lg">
            <Button variant="outline" onClick={() => fileRef.current?.click()} title="Upload image">+</Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
              />
            </div>
            <Button onClick={send} disabled={isSending}>Send</Button>
          </div>
          {image && (
            <div className="mx-auto mt-2 max-w-5xl">
              <div className="inline-flex items-center gap-3 rounded-xl border p-2 pr-3 bg-white/70 dark:bg-black/40 backdrop-blur">
                <Image src={image} alt="preview" width={48} height={48} className="h-12 w-12 rounded object-cover" />
                <button className="text-xs opacity-70 hover:opacity-100" onClick={() => setImage(null)}>Remove</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main >
  );
}

function CarouselColumns({ providers, historyByProvider, isSending, collapsed }: {
  providers: Array<[ProviderKey, string]>;
  historyByProvider: Partial<Record<ProviderKey, Message[]>>;
  isSending: boolean;
  collapsed: Partial<Record<ProviderKey, boolean>>;
}) {
  const [emblaRef] = useEmblaCarousel({ loop: false, dragFree: true });
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4 pb-28">
        {providers.map(([provider]) => (
          <div key={provider} className="min-w-0 shrink-0 grow-0 basis-full">
            <div className="card p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="font-medium capitalize">{provider}</div>
              </div>
              <div className={`mt-3 flex-1 min-h-0 overflow-y-auto pr-1 ${collapsed[provider] ? "hidden" : "flex"} flex-col justify-end space-y-2`}>
                {(historyByProvider[provider] || []).map((m) => (
                  <div key={m.id} className={`animate-fadeIn w-full ${m.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[90%]"}`}>
                    <div className={`rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                      {m.imageDataUrl && (
                        <Image src={m.imageDataUrl} alt="uploaded image" width={512} height={512} className="mb-2 h-auto w-auto max-h-48 rounded-lg" />
                      )}
                      <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="mr-auto max-w-[60%] rounded-2xl bg-black/5 dark:bg-white/10 px-4 py-2">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-current animate-typing" />
                      <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:300ms]" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


