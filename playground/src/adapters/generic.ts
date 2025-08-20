import { now, withAbortTimeout, safeJson } from '../utils/timeout'
import type { ProviderAdapter, SendOptions, UnifiedResponse } from './types'

// Generic adapter for OpenAI-compatible endpoints (e.g., local server)
export function createGenericAdapter(baseUrl: string): ProviderAdapter {
    return {
        id: 'generic',
        name: 'Generic',
        async sendPrompt(apiKey: string, prompt: string, options?: SendOptions): Promise<UnifiedResponse> {
            const { controller, clear } = withAbortTimeout(30_000)
            const started = now()
            try {
                const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
                const res = await fetch(`${url}/v1/chat/completions`, {
                    method: 'POST',
                    signal: options?.signal ?? controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: options?.model || 'gpt-3.5-turbo',
                        temperature: options?.temperature ?? 0.7,
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
            } catch (err: unknown) {
                clear()
                const msg = err instanceof Error ? err.message : 'Error'
                return { text: '', success: false, latencyMs: now() - started, error: msg }
            }
        },
    }
}


