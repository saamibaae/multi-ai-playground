import React from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { ApiKeysProvider } from './context/ApiKeyContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import AppRoutes from './routes.jsx'

function AppProviders({ children }) {
    return (
        <AuthProvider>
            <ApiKeysProvider>
                <ChatProvider>{children}</ChatProvider>
            </ApiKeysProvider>
        </AuthProvider>
    )
}

export default function App() {
    return (
        <AppProviders>
            <AppRoutes />
        </AppProviders>
    )
}


