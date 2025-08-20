import { withAbortTimeout, safeJson, now } from './helpers.js'

export function CustomAdapter(baseUrl) {
    const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return {
        id: 'custom',
        name: 'Custom',
        async sendPrompt(apiKey, prompt, options = {}) {
            const { controller, clear } = withAbortTimeout(30_000)
            const started = now()
            try {
                const res = await fetch(`${url}/v1/chat/completions`, {
                    method: 'POST',
                    signal: options.signal ?? controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: options.model || 'gpt-3.5-turbo',
                        temperature: options.temperature ?? 0.7,
                        messages: [{ role: 'user', content: prompt }],
                    }),
                })
                clear()
                const data = await safeJson(res)
                if (!res.ok) {
                    return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
                }
                const text = data?.choices?.[0]?.message?.content ?? ''
                return { text, raw: data, success: true, latencyMs: now() - started }
            } catch (err) {
                clear()
                const msg = err instanceof Error ? err.message : 'Error'
                return { text: '', success: false, latencyMs: now() - started, error: msg }
            }
        },
    }
}


