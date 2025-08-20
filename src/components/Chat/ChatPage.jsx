import React, { useMemo, useState } from 'react'
import { useChatContext } from '../../context/ChatContext.jsx'
import { useApiKeys } from '../../context/ApiKeyContext.jsx'
import ChatColumn from './ChatColumn.jsx'
import { AnthropicAdapter } from '../../../playground/src/adapters/anthropic'
import { OpenAIAdapter } from '../../../playground/src/adapters/openai'
import { GeminiAdapter } from '../../../playground/src/adapters/gemini'

const providers = [
    { id: 'openai', name: 'OpenAI', adapter: OpenAIAdapter },
    { id: 'gemini', name: 'Gemini', adapter: GeminiAdapter },
    { id: 'anthropic', name: 'Claude', adapter: AnthropicAdapter },
]

export default function ChatPage() {
    const { activeChat, appendMessage } = useChatContext()
    const { keys } = useApiKeys()
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const perProviderMessages = useMemo(() => {
        const userAndAi = activeChat?.messages || []
        const byProvider = { openai: [], gemini: [], anthropic: [] }
        for (const m of userAndAi) {
            if (m.provider) byProvider[m.provider].push(m)
            else {
                byProvider.openai.push(m)
                byProvider.gemini.push(m)
                byProvider.anthropic.push(m)
            }
        }
        return byProvider
    }, [activeChat])

    async function send() {
        const text = input.trim()
        if (!text) return
        setInput('')
        setLoading(true)
        appendMessage('user', text)
        // fire off requests in parallel for providers that have keys
        const calls = providers
            .filter((p) => keys[p.id])
            .map(async (p) => {
                const res = await p.adapter.sendPrompt(keys[p.id], text)
                appendMessage('assistant', res.text || res.error || '', { provider: p.id })
            })
        try {
            await Promise.allSettled(calls)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-56px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-1 overflow-y-hidden">
                {providers.map((p) => (
                    <div key={p.id} className="h-full">
                        <ChatColumn title={p.name} messages={perProviderMessages[p.id]} />
                    </div>
                ))}
            </div>
            <div className="p-4 border-t bg-white">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        className="flex-1 rounded-xl border px-3 py-2"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                send()
                            }
                        }}
                    />
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                        disabled={loading}
                        onClick={send}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}


