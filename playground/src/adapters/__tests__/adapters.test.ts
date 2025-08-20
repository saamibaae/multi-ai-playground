import { expect, test } from '@jest/globals'
import { OpenAIAdapter } from '../../adapters/openai'

test('OpenAI adapter shape', () => {
    expect(OpenAIAdapter.id).toBe('openai')
    expect(typeof OpenAIAdapter.sendPrompt).toBe('function')
})


