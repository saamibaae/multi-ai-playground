import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App.jsx'

// Mock Firebase auth context for tests
vi.mock('../context/AuthContext.jsx', () => {
    const React = require('react')
    const Ctx = React.createContext({ user: { uid: 'u1' }, loading: false, signInWithGoogle: vi.fn(), logout: vi.fn() })
    return {
        AuthProvider: ({ children }) => <Ctx.Provider value={{ user: { uid: 'u1' }, loading: false, signInWithGoogle: vi.fn(), logout: vi.fn() }}>{children}</Ctx.Provider>,
        useAuthContext: () => React.useContext(Ctx),
    }
})

// Mock ApiKeyContext with keys
vi.mock('../context/ApiKeyContext.jsx', () => {
    const React = require('react')
    const state = { keys: { openai: 'k', gemini: 'k', anthropic: 'k', customBase: 'http://localhost:9999' }, hasAnyKey: true, setKeys: vi.fn() }
    const Ctx = React.createContext(state)
    return {
        ApiKeysProvider: ({ children }) => <Ctx.Provider value={state}>{children}</Ctx.Provider>,
        useApiKeys: () => React.useContext(Ctx),
    }
})

// Mock ChatContext with stateful provider so UI updates
vi.mock('../context/ChatContext.jsx', () => {
    const React = require('react')
    const Ctx = React.createContext(null)
    function ChatProvider({ children }) {
        const [chat, setChat] = React.useState({ id: 'c1', title: 'New Chat', createdAt: Date.now(), messages: [] })
        const appendMessage = (role, content, meta = {}) => {
            setChat((prev) => {
                const msg = { id: String(prev.messages.length + 1), role, content, createdAt: Date.now(), ...meta }
                const title = prev.title === 'New Chat' && role === 'user' ? content.slice(0, 32) : prev.title
                return { ...prev, messages: [...prev.messages, msg], title }
            })
        }
        const value = {
            chats: [chat],
            activeChat: chat,
            activeChatId: 'c1',
            appendMessage,
            setActiveChatId: () => { },
            newChat: () => 'c1',
            deleteChat: () => { },
        }
        return React.createElement(Ctx.Provider, { value }, children)
    }
    const useChatContext = () => React.useContext(Ctx)
    return { ChatProvider, useChatContext }
})

// Mock adapters to respond immediately
vi.mock('../adapters/OpenAIAdapter.js', () => ({ OpenAIAdapter: { id: 'openai', name: 'OpenAI', sendPrompt: async () => ({ text: '2 + 2 = 4.', success: true }) } }))
vi.mock('../adapters/GeminiAdapter.js', () => ({ GeminiAdapter: { id: 'gemini', name: 'Gemini', sendPrompt: async () => ({ text: 'The answer is 4.', success: true }) } }))
vi.mock('../adapters/ClaudeAdapter.js', () => ({ ClaudeAdapter: { id: 'anthropic', name: 'Claude', sendPrompt: async () => ({ text: 'It evaluates to 4.', success: true }) } }))
vi.mock('../adapters/CustomAdapter.js', () => ({ CustomAdapter: () => ({ id: 'custom', name: 'Custom', sendPrompt: async () => ({ text: 'Calculated: 4.', success: true }) }) }))

describe('Chat Flow', () => {
    it('renders chat and sends to providers', async () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )

        // Type and send
        const input = screen.getByPlaceholderText('Type a message...')
        fireEvent.change(input, { target: { value: 'What is 2 + 2?' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

        await waitFor(() => {
            expect(screen.getByText('2 + 2 = 4.')).toBeInTheDocument()
            expect(screen.getByText('The answer is 4.')).toBeInTheDocument()
            expect(screen.getByText('It evaluates to 4.')).toBeInTheDocument()
            expect(screen.getByText('Calculated: 4.')).toBeInTheDocument()
        })
    })
})


