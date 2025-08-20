import { expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatColumn from '../../components/ChatColumn'
import { ChatProvider } from '../../contexts/ChatContext'
import { ApiKeysProvider } from '../../contexts/ApiKeysContext'

test('renders ChatColumn UI chrome', () => {
    render(
        <ApiKeysProvider>
            <ChatProvider>
                <ChatColumn columnId={0} />
            </ChatProvider>
        </ApiKeysProvider>
    )
    expect(screen.getByText(/Enabled/i)).not.toBeNull()
})


