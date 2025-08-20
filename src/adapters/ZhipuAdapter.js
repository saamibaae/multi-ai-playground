import { withAbortTimeout, safeJson, now } from './helpers.js'

// Minimal integration for Zhipu GLM chat completions API
// Docs: https://open.bigmodel.cn/dev/api
export const ZhipuAdapter = {
    id: 'zhipu',
    name: 'Zhipu',
    async sendPrompt(apiKey, prompt, options = {}) {
        const model = options.model || 'glm-4-flash'
        const { controller, clear } = withAbortTimeout(30_000)
        const started = now()
        try {
            const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                signal: options.signal ?? controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature ?? 0.7,
                }),
            })
            clear()
            const data = await safeJson(res)
            if (!res.ok) {
                return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
            }
            const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || ''
            return { text, raw: data, success: true, latencyMs: now() - started }
        } catch (err) {
            clear()
            const msg = err instanceof Error ? err.message : 'Error'
            return { text: '', success: false, latencyMs: now() - started, error: msg }
        }
    },
}


