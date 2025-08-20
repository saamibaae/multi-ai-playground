import { withAbortTimeout, safeJson, now } from './helpers.js'

export const GeminiAdapter = {
    id: 'gemini',
    name: 'Google Gemini',
    async sendPrompt(apiKey, prompt, options = {}) {
        const model = options.model || (import.meta.env.VITE_DEFAULT_GEMINI_MODEL || 'gemini-1.5-flash')
        const { controller, clear } = withAbortTimeout(30_000)
        const started = now()
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
            const res = await fetch(endpoint, {
                method: 'POST',
                signal: options.signal ?? controller.signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: options.temperature ?? 0.7 },
                }),
            })
            clear()
            const data = await safeJson(res)
            if (!res.ok) {
                return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
            }
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            return { text, raw: data, success: true, latencyMs: now() - started }
        } catch (err) {
            clear()
            const msg = err instanceof Error ? err.message : 'Error'
            return { text: '', success: false, latencyMs: now() - started, error: msg }
        }
    },
}


