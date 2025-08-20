import { now, withAbortTimeout, safeJson } from '../utils/timeout'
import type { ProviderAdapter, SendOptions, UnifiedResponse } from './types'

// Minimal REST call for Google Generative Language API (Gemini)
export const GeminiAdapter: ProviderAdapter = {
    id: 'gemini',
    name: 'Google Gemini',
    async sendPrompt(apiKey: string, prompt: string, options?: SendOptions): Promise<UnifiedResponse> {
        const model = options?.model || 'gemini-1.5-flash'
        const { controller, clear } = withAbortTimeout(30_000)
        const started = now()
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
                apiKey,
            )}`
            const res = await fetch(endpoint, {
                method: 'POST',
                signal: options?.signal ?? controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: options?.temperature ?? 0.7 },
                }),
            })
            clear()
            const data = await safeJson(res)
            if (!res.ok) {
                return { text: '', raw: data, success: false, latencyMs: now() - started, error: data?.error?.message || res.statusText }
            }
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            return { text, raw: data, success: true, latencyMs: now() - started }
        } catch (err: unknown) {
            clear()
            const msg = err instanceof Error ? err.message : 'Error'
            return { text: '', success: false, latencyMs: now() - started, error: msg }
        }
    },
}


