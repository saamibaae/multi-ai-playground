import { useEffect, useState } from 'react'
import { ChatProvider, useChat } from '../contexts/ChatContext'
import { useApiKeys } from '../contexts/ApiKeysContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatColumn from '../components/ChatColumn'

function ChatInner() {
    const navigate = useNavigate()
    const { providers } = useApiKeys()
    const { sendGlobalPrompt, clearChat, copyTranscript, downloadTranscript } = useChat()
    const [input, setInput] = useState('')
    const [busy, setBusy] = useState(false)

    // Gate: if no providers have keys, redirect to setup
    useEffect(() => {
        const hasAnyKey = Object.values(providers).some((p) => !!p?.apiKey)
        if (!hasAnyKey) {
            navigate('/setup', { replace: true })
        }
    }, [providers, navigate])

    const handleSend = async () => {
        if (!input.trim() || busy) return
        setBusy(true)
        await sendGlobalPrompt(input)
        setBusy(false)
        setInput('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex min-w-0 min-h-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b p-3">
                    <h1 className="text-lg font-semibold">Playground</h1>
                    <div className="flex items-center gap-2">
                        <button className="rounded border px-3 py-1 text-sm" onClick={clearChat}>New Chat</button>
                        <button className="rounded border px-3 py-1 text-sm" onClick={copyTranscript}>Copy</button>
                        <button className="rounded border px-3 py-1 text-sm" onClick={downloadTranscript}>Download</button>
                    </div>
                </header>
                <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ChatColumn columnId={0} />
                    <ChatColumn columnId={1} />
                    <ChatColumn columnId={2} />
                </main>
                <footer className="border-t p-3 bg-white flex-none sticky bottom-0">
                    <div className="mx-auto flex max-w-4xl items-end gap-2">
                        <textarea
                            aria-label="Ask me anything"
                            placeholder="Ask me anything…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[44px] flex-1 resize-y rounded border border-gray-300 p-2"
                        />
                        <button
                            onClick={handleSend}
                            disabled={busy}
                            className="h-[44px] rounded bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default function ChatPage() {
    return (
        <ChatProvider>
            <ChatInner />
        </ChatProvider>
    )
}


