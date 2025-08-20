import { OpenAIAdapter } from '../../playground/src/adapters/openai'
import { GeminiAdapter } from '../../playground/src/adapters/gemini'
import { AnthropicAdapter } from '../../playground/src/adapters/anthropic'

export function getProviders() {
    return [
        { id: 'openai', name: 'OpenAI', adapter: OpenAIAdapter },
        { id: 'gemini', name: 'Gemini', adapter: GeminiAdapter },
        { id: 'anthropic', name: 'Claude', adapter: AnthropicAdapter },
    ]
}


