import React, { useState } from 'react'

export default function InputBar({ onSend, loading }) {
    const [value, setValue] = useState('')
    return (
        <div className="p-3 md:p-4 border-t bg-white sticky bottom-0 flex-none">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
                <input
                    className="flex-1 rounded-xl border px-3 py-3 text-[16px]"
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
                    className="px-4 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                    disabled={loading}
                    onClick={() => onSend?.(value, () => setValue(''))}
                >
                    Send
                </button>
            </div>
        </div>
    )
}


