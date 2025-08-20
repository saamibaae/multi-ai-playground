import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ApiKeysProvider } from './contexts/ApiKeysContext'
import LoginPage from './pages/Login'
import SetupPage from './pages/Setup'
import ChatPage from './pages/Chat'

function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 bg-white rounded-xl shadow-md">
                <h1 className="text-2xl font-semibold">Multi-AI Playground</h1>
                <p className="text-gray-600 mt-2">Scaffold ready. Next: Auth, API keys, Adapters, Chat UI.</p>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <ApiKeysProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/setup" element={<SetupPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ApiKeysProvider>
        </AuthProvider>
    )
}


