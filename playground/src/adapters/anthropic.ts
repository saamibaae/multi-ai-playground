import { now, withAbortTimeout, safeJson } from '../utils/timeout'
import type { ProviderAdapter, SendOptions, UnifiedResponse } from './types'

export const AnthropicAdapter: ProviderAdapter = {
    id: 'anthropic',
    name: 'Anthropic Claude',
    async sendPrompt(apiKey: string, prompt: string, options?: SendOptions): Promise<UnifiedResponse> {
        const model = options?.model || 'claude-3-haiku-20240307'
        const { controller, clear } = withAbortTimeout(30_000)
        const started = now()
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                signal: options?.signal ?? controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model,
                    max_tokens: 1024,
                    temperature: options?.temperature ?? 0.7,
                    messages: [{ role: 'user', content: prompt }],
                }),
            })
            clear()
            const data = await safeJson(res)
            if (!res.ok) {
                return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
            }
            const text = data?.content?.[0]?.text ?? ''
            return { text, raw: data, success: true, latencyMs: now() - started }
        } catch (err: unknown) {
            clear()
            const msg = err instanceof Error ? err.message : 'Error'
            return { text: '', success: false, latencyMs: now() - started, error: msg }
        }
    },
}


