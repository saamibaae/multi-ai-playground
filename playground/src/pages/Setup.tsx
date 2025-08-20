import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys, ProviderId, ProviderConfig } from '../contexts/ApiKeysContext'

const PROVIDERS: { id: ProviderId; name: string; needsBaseUrl?: boolean }[] = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'anthropic', name: 'Anthropic Claude' },
    { id: 'generic', name: 'Generic / Local' },
]

export default function SetupPage() {
    const { providers, saveProvider, removeProvider } = useApiKeys()
    const navigate = useNavigate()
    const [form, setForm] = useState<ProviderConfig>({ id: 'openai', label: 'OpenAI', apiKey: '' })
    const [error, setError] = useState<string | null>(null)

    // If there is at least one saved provider with a key, allow skipping setup by redirecting to /chat
    useEffect(() => {
        const hasAnyKey = Object.values(providers).some((p) => !!p?.apiKey)
        if (hasAnyKey) {
            navigate('/chat', { replace: true })
        }
    }, [providers])

    const handleSave = () => {
        if (!form.apiKey.trim()) {
            setError('API key is required')
            return
        }
        saveProvider({ ...form, active: true })
        setForm({ id: 'openai', label: 'OpenAI', apiKey: '' })
        setError(null)
    }

    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold">Provider API Keys</h1>
                    <p className="text-gray-600">Add keys for providers you want to use.</p>
                </header>

                <section className="rounded-xl bg-white p-4 shadow">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-sm text-gray-700">Provider</span>
                            <select
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                                value={form.id}
                                onChange={(e) => {
                                    const id = e.target.value as ProviderId
                                    const name = PROVIDERS.find((p) => p.id === id)?.name ?? id
                                    setForm((f) => ({ ...f, id, label: name }))
                                }}
                            >
                                {PROVIDERS.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm text-gray-700">Label</span>
                            <input
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                                value={form.label}
                                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                                placeholder="Display label"
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="text-sm text-gray-700">API Key</span>
                            <input
                                type="password"
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                                value={form.apiKey}
                                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value.trim() }))}
                                placeholder="sk-..."
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="text-sm text-gray-700">Base URL (optional for Generic)</span>
                            <input
                                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                                value={form.baseUrl ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value.trim() }))}
                                placeholder="http://localhost:11434/v1"
                            />
                        </label>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black"
                        >
                            Save Provider
                        </button>
                        <button
                            onClick={() => navigate('/chat')}
                            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                        >
                            Continue to Chat
                        </button>
                    </div>
                </section>

                <section className="rounded-xl bg-white p-4 shadow">
                    <h2 className="mb-3 text-lg font-medium">Saved Providers</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(providers).map(([id, cfg]) => (
                            <div key={id} className="rounded border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{cfg?.label ?? id}</p>
                                        <p className="text-xs text-gray-500">{id}</p>
                                    </div>
                                    <button
                                        className="text-sm text-red-600 hover:underline"
                                        onClick={() => removeProvider(id as ProviderId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                                {cfg?.baseUrl && (
                                    <p className="mt-2 truncate text-xs text-gray-500">{cfg.baseUrl}</p>
                                )}
                                {cfg?.apiKey && (
                                    <p className="mt-1 text-xs text-gray-400">Key saved locally</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}


