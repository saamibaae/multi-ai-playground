import React from 'react'
import { PlusCircle, Settings, History, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatContext } from '../../context/ChatContext.jsx'
import { useApiKeys } from '../../context/ApiKeyContext.jsx'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar() {
    const { chats, activeChatId, setActiveChatId, newChat, deleteChat } = useChatContext()
    const navigate = useNavigate()
    const location = useLocation()
    const { keys, setKeys } = useApiKeys()

    function toggleProvider(id) {
        const next = { ...(keys.hidden || {}), [id]: !(keys.hidden?.[id]) }
        setKeys({ ...keys, hidden: next })
    }

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-72 shrink-0 h-screen sticky top-0 bg-gray-900 text-white flex flex-col"
        >
            <div className="p-4 flex items-center justify-between">
                <div className="font-semibold">Multi AI</div>
                <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-800" onClick={() => setActiveChatId(newChat())}>
                    <PlusCircle size={18} /> New Chat
                </button>
            </div>
            <div className="px-4 text-xs uppercase text-gray-400 flex items-center gap-2">
                <History size={14} /> History
            </div>
            <div className="mt-2 flex-1 overflow-y-auto">
                {chats.map((c) => (
                    <button
                        key={c.id}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-800 rounded-md ${c.id === activeChatId ? 'bg-gray-800' : ''}`}
                        onClick={() => setActiveChatId(c.id)}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            if (confirm('Delete conversation?')) deleteChat(c.id)
                        }}
                    >
                        <div className="text-sm truncate">{c.title}</div>
                        <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </button>
                ))}
            </div>
            <div className="p-4 border-t border-gray-800 space-y-2">
                <div className="text-xs uppercase text-gray-400">Toggle Providers</div>
                <div className="flex flex-col gap-1 text-sm">
                    {[
                        { id: 'openai', label: 'OpenAI' },
                        { id: 'gemini', label: 'Gemini' },
                        { id: 'anthropic', label: 'Claude' },
                        { id: 'zhipu', label: 'Zhipu' },
                        { id: 'custom', label: 'Custom' },
                    ].map(p => (
                        <button key={p.id} className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-800"
                            onClick={() => toggleProvider(p.id)}>
                            {(keys.hidden?.[p.id]) ? <EyeOff size={16} /> : <Eye size={16} />}
                            {p.label}
                        </button>
                    ))}
                </div>
                <Link className="inline-flex items-center gap-2 text-sm rounded-md px-2 py-1 hover:bg-gray-800" to="/apikey">
                    <Settings size={16} /> Settings
                </Link>
            </div>
        </motion.aside>
    )
}


