import type { ProviderAdapter } from './types'
import { OpenAIAdapter } from './openai'
import { GeminiAdapter } from './gemini'
import { AnthropicAdapter } from './anthropic'
import { createGenericAdapter } from './generic'

export const builtinAdapters: Record<string, ProviderAdapter> = {
    openai: OpenAIAdapter,
    gemini: GeminiAdapter,
    anthropic: AnthropicAdapter,
}

export function resolveAdapter(id: string, baseUrl?: string): ProviderAdapter | null {
    if (id === 'generic') {
        if (!baseUrl) return null
        return createGenericAdapter(baseUrl)
    }
    return (builtinAdapters as Record<string, ProviderAdapter>)[id] ?? null
}


