import { useMemo, useRef, useEffect } from 'react'
import { useChat } from '../contexts/ChatContext'
import type { ProviderId } from '../types/providers'

const PROVIDER_NAMES: Record<ProviderId, string> = {
    openai: 'OpenAI',
    gemini: 'Gemini',
    anthropic: 'Claude',
    generic: 'Generic',
}

export default function ChatColumn({ columnId }: { columnId: number }) {
    const { columns, toggleColumn, setColumnProvider, messagesByColumn, retryLast } = useChat()
    const col = useMemo(() => columns.find((c) => c.id === columnId), [columns, columnId])
    const listRef = useRef<HTMLDivElement>(null)
    const endRef = useRef<HTMLDivElement>(null)

    const messages = messagesByColumn[columnId] ?? []

    // Ensure initial mount scrolls to bottom
    useEffect(() => {
        const el = listRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [])

    // Auto-scroll to bottom if user is near the bottom, to avoid jitter when reading older messages
    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
        const isNearBottom = distanceFromBottom < 80
        const scroll = () => {
            if (isNearBottom) {
                const node = endRef.current
                if (node && typeof node.scrollIntoView === 'function') {
                    node.scrollIntoView({ behavior: 'smooth', block: 'end' })
                } else {
                    el.scrollTop = el.scrollHeight
                }
            }
        }
        const id = requestAnimationFrame(scroll)
        return () => cancelAnimationFrame(id)
    }, [messages.length])

    return (
        <div className="flex h-full min-h-0 flex-col rounded-lg border bg-white">
            <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                    <select
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        value={col?.provider ?? ''}
                        onChange={(e) => setColumnProvider(columnId, e.target.value as ProviderId)}
                    >
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="generic">Generic</option>
                    </select>
                    <span className="text-sm text-gray-600">{col?.provider ? PROVIDER_NAMES[col.provider] : '—'}</span>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!col?.active} onChange={() => toggleColumn(columnId)} />
                    Enabled
                </label>
            </div>
            <div ref={listRef} className="flex-1 space-y-2 overflow-auto p-3 scroll-smooth overscroll-contain pr-2" style={{ scrollbarGutter: 'stable' }}>
                {messages.map((m) => (
                    <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                        <div
                            className={
                                'inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 ' +
                                (m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900')
                            }
                        >
                            {m.text || (m.status === 'pending' ? '…' : '')}
                        </div>
                        {m.role === 'assistant' && (
                            <div className="mt-1 text-xs text-gray-500">
                                {m.status === 'pending' && 'Waiting…'}
                                {m.status === 'success' && (m.latencyMs ? `${Math.round(m.latencyMs)} ms` : 'Done')}
                                {m.status === 'error' && (
                                    <span className="inline-flex items-center gap-2">
                                        {m.error || 'Error'}
                                        <button className="text-blue-600 hover:underline" onClick={() => retryLast(columnId)}>Retry</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    )
}


