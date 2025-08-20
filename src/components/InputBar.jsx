import React, { useState } from 'react'

export default function InputBar({ onSend, loading }) {
    const [value, setValue] = useState('')
    return (
        <div className="p-4 border-t bg-white sticky bottom-0 flex-none">
            <div className="max-w-4xl mx-auto flex gap-2">
                <input
                    className="flex-1 rounded-xl border px-3 py-2"
                    placeholder="Type a message..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            onSend?.(value, () => setValue(''))
                        }
                    }}
                />
                <button
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                    disabled={loading}
                    onClick={() => onSend?.(value, () => setValue(''))}
                >
                    Send
                </button>
            </div>
        </div>
    )
}


