import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys } from '../context/ApiKeyContext.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'

const tabs = [
    { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
    { id: 'gemini', label: 'Gemini', placeholder: 'AIza...' },
    { id: 'anthropic', label: 'Anthropic', placeholder: 'anthropic-key' },
    { id: 'zhipu', label: 'Zhipu AI', placeholder: 'ZHIPU_API_KEY' },
    { id: 'custom', label: 'Custom', placeholder: 'http(s)://your-api-base' },
]

export default function ApiSetup() {
    const navigate = useNavigate()
    const { keys, setKeys, hasAnyKey, clearKeys, loading } = useApiKeys()
    const { user, logout } = useAuthContext()
    const [active, setActive] = useState('openai')
    const [local, setLocal] = useState({ ...keys, customBase: keys.customBase || '', customKey: keys.customKey || '' })
    const [showSuccess, setShowSuccess] = useState(false)

    // Update local state when keys are loaded from Firebase
    useEffect(() => {
        setLocal({ ...keys, customBase: keys.customBase || '', customKey: keys.customKey || '' })
    }, [keys])

    function saveAndContinue() {
        setKeys(local)
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            navigate('/chat')
        }, 1500)
    }

    function handleClearKeys() {
        if (confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
            clearKeys()
            setLocal({ openai: '', gemini: '', anthropic: '', zhipu: '', customBase: '', customKey: '' })
            setShowSuccess(false)
        }
    }

    async function handleLogout() {
        if (confirm('Are you sure you want to log out? You will need to sign in again to access your data.')) {
            try {
                await logout()
                navigate('/login')
            } catch (error) {
                console.error('Error logging out:', error)
                alert('Failed to log out. Please try again.')
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-sm text-neutral-500">Loading API keys…</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-3">
            <div className="card max-w-xl w-full">
                {/* User Info Header */}
                {user && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                        <div className="flex items-center gap-3">
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div>
                                <div className="text-sm font-medium">{user.displayName || 'User'}</div>
                                <div className="text-xs text-neutral-500">{user.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                )}

                <h2 className="text-xl font-semibold">Manage API Keys</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            className={`px-3 py-2 rounded-md text-sm ${active === t.id ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'}`}
                            onClick={() => setActive(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    {active === 'custom' ? (
                        <>
                            <label className="block text-sm mb-2">Base URL</label>
                            <input
                                className="w-full rounded-lg border px-3 py-2 mb-3"
                                placeholder="https://api.deepseek.com/v1"
                                type="text"
                                value={local.customBase || ''}
                                onChange={(e) => setLocal({ ...local, customBase: e.target.value })}
                            />
                            <label className="block text-sm mb-2">API Key</label>
                            <input
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="sk-or-v1-..."
                                type="password"
                                value={local.customKey || ''}
                                onChange={(e) => setLocal({ ...local, customKey: e.target.value })}
                            />
                        </>
                    ) : (
                        <>
                            <label className="block text-sm mb-2">{tabs.find(t => t.id === active)?.label} API Key</label>
                            <input
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder={tabs.find((t) => t.id === active)?.placeholder}
                                type="password"
                                value={local[active] || ''}
                                onChange={(e) => setLocal({ ...local, [active]: e.target.value })}
                            />
                        </>
                    )}
                </div>
                <div className="mt-3 text-xs text-neutral-500">Your keys are securely stored in Firebase and synced across devices.</div>

                {showSuccess && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm">
                        ✅ API keys saved successfully! Redirecting to chat...
                    </div>
                )}

                <div className="mt-6 flex justify-between">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-neutral-200" onClick={() => navigate('/chat')}>
                            Skip
                        </button>
                        {hasAnyKey && (
                            <button
                                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                onClick={handleClearKeys}
                            >
                                Clear All Keys
                            </button>
                        )}
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                        disabled={!local.openai && !local.gemini && !local.anthropic && !local.zhipu && (!local.customBase || !local.customKey)}
                        onClick={saveAndContinue}
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    )
}