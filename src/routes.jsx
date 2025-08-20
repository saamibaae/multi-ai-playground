import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import ApiSetup from './pages/ApiSetup.jsx'
import Chat from './pages/Chat.jsx'
import { useAuthContext } from './context/AuthContext.jsx'
import { useApiKeys } from './context/ApiKeyContext.jsx'

function Private({ children }) {
    const { user, loading } = useAuthContext()
    const location = useLocation()
    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-sm text-neutral-500">Loading…</div>
            </div>
        )
    }
    return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function KeysGate({ children }) {
    const { hasAnyKey, loading: keysLoading } = useApiKeys()

    if (keysLoading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-sm text-neutral-500">Loading API keys…</div>
            </div>
        )
    }

    return hasAnyKey ? children : <Navigate to="/apikey" replace />
}

function DefaultRoute() {
    const { hasAnyKey, loading: keysLoading } = useApiKeys()
    const { user, loading: authLoading } = useAuthContext()

    if (authLoading || keysLoading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-sm text-neutral-500">Loading…</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Navigate to={hasAnyKey ? "/chat" : "/apikey"} replace />
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/apikey" element={<Private><ApiSetup /></Private>} />
            <Route path="/chat" element={<Private><KeysGate><Chat /></KeysGate></Private>} />
            <Route path="/" element={<DefaultRoute />} />
            <Route path="*" element={<DefaultRoute />} />
        </Routes>
    )
}


