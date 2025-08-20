import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Layout/Sidebar.jsx'
import ChatColumn from '../components/Chat/ChatColumn.jsx'
import InputBar from '../components/InputBar.jsx'
import { useChatContext } from '../context/ChatContext.jsx'
import { useApiKeys } from '../context/ApiKeyContext.jsx'
import { OpenAIAdapter } from '../adapters/OpenAIAdapter.js'
import { GeminiAdapter } from '../adapters/GeminiAdapter.js'
import { ClaudeAdapter } from '../adapters/ClaudeAdapter.js'
import { ZhipuAdapter } from '../adapters/ZhipuAdapter.js'
import { CustomAdapter } from '../adapters/CustomAdapter.js'
import { Menu } from 'lucide-react'

export default function Chat() {
    const { activeChat, appendMessage } = useChatContext()
    const { keys } = useApiKeys()
    const [loading, setLoading] = useState(false)

    const providers = useMemo(() => {
        const hidden = keys.hidden || {}
        const list = [
            { id: 'openai', name: 'OpenAI', adapter: OpenAIAdapter, enabled: !!keys.openai && !hidden.openai },
            { id: 'gemini', name: 'Gemini', adapter: GeminiAdapter, enabled: !!keys.gemini && !hidden.gemini },
            { id: 'anthropic', name: 'Claude', adapter: ClaudeAdapter, enabled: !!keys.anthropic && !hidden.anthropic },
            { id: 'zhipu', name: 'Zhipu', adapter: ZhipuAdapter, enabled: !!keys.zhipu && !hidden.zhipu },
        ]
        if (keys.customBase) list.push({ id: 'custom', name: 'Custom', adapter: CustomAdapter(keys.customBase), enabled: true })
        return list
    }, [keys])

    const perProviderMessages = useMemo(() => {
        const userAndAi = activeChat?.messages || []
        const byProvider = Object.fromEntries(providers.map((p) => [p.id, []]))
        for (const m of userAndAi) {
            if (m.provider && byProvider[m.provider]) byProvider[m.provider].push(m)
            else {
                for (const p of providers) byProvider[p.id].push(m)
            }
        }
        return byProvider
    }, [activeChat, providers])

    async function send(text, onClear) {
        const trimmed = (text || '').trim()
        if (!trimmed) return
        onClear?.()
        setLoading(true)
        appendMessage('user', trimmed)
        const calls = providers
            .filter((p) => p.enabled)
            .map(async (p) => {
                const key = p.id === 'custom' ? keys.openai || keys.gemini || keys.anthropic || '' : keys[p.id]
                try {
                    const res = await p.adapter.sendPrompt(key, trimmed)
                    appendMessage('assistant', res.text || res.error || '', { provider: p.id })
                } catch (err) {
                    appendMessage('assistant', (err instanceof Error ? err.message : 'Error'), { provider: p.id })
                }
            })
        try {
            await Promise.allSettled(calls)
        } finally {
            setLoading(false)
        }
    }

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop sidebar */}
            <Sidebar mobile={false} />

            {/* Mobile slide-over */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="relative ml-0 h-full w-72 bg-gray-900 text-white shadow-xl">
                        <Sidebar mobile className="h-full" />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-0">
                {/* Mobile top bar */}
                <div className="md:hidden sticky top-0 z-30 bg-white border-b">
                    <div className="flex items-center justify-between px-3 py-2">
                        <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 border" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={18} />
                            Menu
                        </button>
                        <div className="text-sm text-neutral-600">Multi AI Playground</div>
                        <div className="w-[64px]" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto p-3 md:p-4">
                    {providers.filter(p => p.enabled).map((p) => (
                        <div key={p.id} className="h-full flex flex-col p-2 md:p-4">
                            <ChatColumn title={p.name} messages={perProviderMessages[p.id] || []} />
                        </div>
                    ))}
                </div>
                <InputBar onSend={send} loading={loading} />
            </div>
        </div>
    )
}


