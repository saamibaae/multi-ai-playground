import React from 'react'

export default function ChatMessage({ role, content }) {
    const isUser = role === 'user'
    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-1`}>
            <div
                className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                    }`}
            >
                {content}
            </div>
        </div>
    )
}


