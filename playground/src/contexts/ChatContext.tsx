import React, { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type { ProviderId } from '../types/providers'
import { useApiKeys } from './ApiKeysContext'
import { resolveAdapter } from '../adapters'
import type { UnifiedResponse } from '../adapters/types'

export type Message = {
    id: string
    role: 'user' | 'assistant'
    provider?: ProviderId
    text: string
    status?: 'pending' | 'success' | 'error'
    latencyMs?: number
    error?: string
}

export type ColumnConfig = {
    id: number
    provider: ProviderId | null
    active: boolean
}

type ChatContextValue = {
    columns: ColumnConfig[]
    setColumnProvider: (idx: number, provider: ProviderId | null) => void
    toggleColumn: (idx: number) => void
    messagesByColumn: Record<number, Message[]>
    sendGlobalPrompt: (prompt: string) => Promise<void>
    retryLast: (columnId: number) => Promise<void>
    copyTranscript: () => string
    downloadTranscript: () => void
    clearChat: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function uid() {
    return Math.random().toString(36).slice(2)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { providers } = useApiKeys()
    const [columns, setColumns] = useState<ColumnConfig[]>([
        { id: 0, provider: 'openai', active: true },
        { id: 1, provider: 'gemini', active: true },
        { id: 2, provider: 'anthropic', active: true },
    ])
    const [messagesByColumn, setMessagesByColumn] = useState<Record<number, Message[]>>({
        0: [],
        1: [],
        2: [],
    })
    const abortRef = useRef<AbortController | null>(null)

    // Persistence: load on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('map_chat_state_v1')
            if (raw) {
                const parsed = JSON.parse(raw) as { columns?: ColumnConfig[]; messagesByColumn?: Record<number, Message[]> }
                if (parsed.columns && Array.isArray(parsed.columns)) {
                    setColumns((prev) => {
                        // ensure required ids exist 0,1,2 in case older data missing
                        const byId = new Map(parsed.columns.map((c) => [c.id, c]))
                        const ensured: ColumnConfig[] = [0, 1, 2].map((id) => byId.get(id) || { id, provider: id === 0 ? 'openai' : id === 1 ? 'gemini' : 'anthropic', active: true })
                        return ensured
                    })
                }
                if (parsed.messagesByColumn) {
                    setMessagesByColumn((prev) => ({ 0: [], 1: [], 2: [], ...parsed.messagesByColumn }))
                }
            }
        } catch {
            // ignore
        }
    }, [])

    // Persistence: save on changes
    useEffect(() => {
        try {
            localStorage.setItem('map_chat_state_v1', JSON.stringify({ columns, messagesByColumn }))
        } catch {
            // ignore
        }
    }, [columns, messagesByColumn])

    const setColumnProvider = useCallback((idx: number, provider: ProviderId | null) => {
        setColumns((prev) => prev.map((c) => (c.id === idx ? { ...c, provider } : c)))
    }, [])

    const toggleColumn = useCallback((idx: number) => {
        setColumns((prev) => prev.map((c) => (c.id === idx ? { ...c, active: !c.active } : c)))
    }, [])

    const clearChat = useCallback(() => {
        setMessagesByColumn({ 0: [], 1: [], 2: [] })
    }, [])

    const sendGlobalPrompt = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return

        // cancel previous run
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        const actives = columns.filter((c) => c.active && c.provider)
        if (actives.length === 0) return

        // push user message and assistant placeholders
        setMessagesByColumn((prev) => {
            const next = { ...prev }
            for (const c of actives) {
                next[c.id] = [
                    ...next[c.id],
                    { id: uid(), role: 'user', text: prompt },
                    { id: uid(), role: 'assistant', provider: c.provider!, text: '', status: 'pending' as const },
                ]
            }
            return next
        })

        const tasks = actives.map(async (c) => {
            const providerId = c.provider!
            const cfg = providers[providerId]
            const adapter = resolveAdapter(providerId, cfg?.baseUrl)
            const apiKey = cfg?.apiKey || ''
            if (!adapter || !apiKey) {
                return { columnId: c.id, response: { text: '', success: false, error: 'Missing provider or API key' } as UnifiedResponse }
            }
            const response = await adapter.sendPrompt(apiKey, prompt, { signal: abortRef.current!.signal })
            return { columnId: c.id, response }
        })

        const results = await Promise.allSettled(tasks)
        setMessagesByColumn((prev) => {
            const next = { ...prev }
            for (const r of results) {
                if (r.status === 'fulfilled') {
                    const { columnId, response } = r.value
                    const list = next[columnId] ?? []
                    const lastIdx = [...list].reverse().findIndex((m) => m.role === 'assistant' && m.status === 'pending')
                    if (lastIdx !== -1) {
                        const idx = list.length - 1 - lastIdx
                        const updatedMessage: Message = { ...list[idx], text: response.text, status: response.success ? 'success' : 'error', latencyMs: response.latencyMs, error: response.error };
                        next[columnId] = [...list.slice(0, idx), updatedMessage, ...list.slice(idx + 1)];
                    }
                }
            }
            return next
        })
    }, [columns, providers])

    const retryLast = useCallback(async (columnId: number) => {
        const col = columns.find((c) => c.id === columnId)
        if (!col || !col.provider) return
        const cfg = providers[col.provider]
        const adapter = resolveAdapter(col.provider, cfg?.baseUrl)
        const apiKey = cfg?.apiKey || ''
        if (!adapter || !apiKey) return
        const list = messagesByColumn[columnId] ?? []
        const lastUser = [...list].reverse().find((m) => m.role === 'user')
        if (!lastUser) return
        const newMessage: Message = { id: uid(), role: 'assistant', provider: col.provider ?? undefined, text: '', status: 'pending' };
        setMessagesByColumn((prev) => ({
            ...prev,
            [columnId]: [...list, newMessage],
        }));
        const res = await adapter.sendPrompt(apiKey, lastUser.text)
        setMessagesByColumn((prev) => {
            const curr = prev[columnId] ?? []
            const lastIdx = [...curr].reverse().findIndex((m) => m.role === 'assistant' && m.status === 'pending')
            if (lastIdx === -1) return prev
            const idx = curr.length - 1 - lastIdx
            const updatedMessage: Message = { ...curr[idx], text: res.text, status: res.success ? 'success' : 'error', latencyMs: res.latencyMs, error: res.error };
            return { ...prev, [columnId]: [...curr.slice(0, idx), updatedMessage, ...curr.slice(idx + 1)] };
        })
    }, [columns, messagesByColumn, providers])

    const copyTranscript = useCallback(() => {
        const lines: string[] = []
        for (const col of columns) {
            const msgs = messagesByColumn[col.id] ?? []
            lines.push(`# Column ${col.id + 1} (${col.provider ?? '—'})`)
            for (const m of msgs) {
                lines.push(`${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
            }
            lines.push('')
        }
        const text = lines.join('\n')
        navigator?.clipboard?.writeText?.(text)
        return text
    }, [columns, messagesByColumn])

    const downloadTranscript = useCallback(() => {
        const payload = { columns, messagesByColumn }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'chat-session.json'
        a.click()
        URL.revokeObjectURL(url)
    }, [columns, messagesByColumn])

    const value = useMemo(
        () => ({ columns, setColumnProvider, toggleColumn, messagesByColumn, sendGlobalPrompt, retryLast, copyTranscript, downloadTranscript, clearChat }),
        [columns, messagesByColumn, sendGlobalPrompt, retryLast, copyTranscript, downloadTranscript, clearChat, setColumnProvider, toggleColumn],
    )

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error('useChat must be used within ChatProvider')
    return ctx
}


