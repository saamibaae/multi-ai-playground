import type { ProviderId } from '../types/providers'

export type UnifiedResponse = {
    text: string
    raw?: unknown
    tokensUsed?: number
    latencyMs?: number
    success: boolean
    error?: string
}

export type SendOptions = {
    model?: string
    temperature?: number
    signal?: AbortSignal
}

export interface ProviderAdapter {
    id: ProviderId
    name: string
    sendPrompt: (apiKey: string, prompt: string, options?: SendOptions) => Promise<UnifiedResponse>
}


