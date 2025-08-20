import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage.jsx'

export default function ChatColumn({ title, messages }) {
    const scrollerRef = useRef(null)
    const endRef = useRef(null)

    useEffect(() => {
        const el = scrollerRef.current
        if (el) {
            el.scrollTop = el.scrollHeight
        }
    }, [messages?.length])
    return (
        <div className="card h-full flex flex-col min-h-0">
            <div className="text-sm font-semibold mb-2 sticky top-0 z-10 bg-white/85 backdrop-blur rounded-xl p-1">{title}</div>
            <div
                ref={scrollerRef}
                className="flex-1 overflow-y-auto scroll-smooth overscroll-contain pr-2"
                style={{ scrollbarGutter: 'stable' }}
            >
                <div className="flex flex-col space-y-1">
                    {messages.length === 0 && (
                        <div className="text-sm text-neutral-500">No messages yet.</div>
                    )}
                    {messages.map((m) => (
                        <ChatMessage key={m.id} role={m.role} content={m.content} />
                    ))}
                    <div ref={endRef} />
                </div>
            </div>
        </div>
    )
}