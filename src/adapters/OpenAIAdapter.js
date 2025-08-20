import { withAbortTimeout, safeJson, now } from './helpers.js'

export const OpenAIAdapter = {
    id: 'openai',
    name: 'OpenAI',
    async sendPrompt(apiKey, prompt, options = {}) {
        const { controller, clear } = withAbortTimeout(30_000)
        const started = now()
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                signal: options.signal ?? controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: options.model || (import.meta.env.VITE_DEFAULT_OPENAI_MODEL || 'gpt-4o-mini'),
                    temperature: options.temperature ?? 0.7,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            clear()
            const data = await safeJson(res)
            if (!res.ok) {
                return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
            }
            const content = data?.choices?.[0]?.message?.content ?? ''
            const tokensUsed = data?.usage?.total_tokens
            return { text: content, raw: data, tokensUsed, success: true, latencyMs: now() - started }
        } catch (err) {
            clear()
            const msg = err instanceof Error ? err.message : 'Error'
            return { text: '', success: false, latencyMs: now() - started, error: msg }
        }
    },
}


