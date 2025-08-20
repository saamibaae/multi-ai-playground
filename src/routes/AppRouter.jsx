import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from '../components/Auth/LoginPage.jsx'
import ApiKeyPage from '../components/Settings/ApiKeyPage.jsx'
import ChatPage from '../components/Chat/ChatPage.jsx'
import Navbar from '../components/Layout/Navbar.jsx'
import Sidebar from '../components/Layout/Sidebar.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useApiKeys } from '../context/ApiKeyContext.jsx'

function PrivateRoute({ children }) {
    const { user, loading } = useAuthContext()
    const location = useLocation()
    if (loading) return null
    return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function KeysGate({ children }) {
    const { hasAnyKey } = useApiKeys()
    if (!hasAnyKey) return <Navigate to="/apikey" replace />
    return children
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/apikey"
                element={
                    <PrivateRoute>
                        <ApiKeyPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/chat"
                element={
                    <PrivateRoute>
                        <KeysGate>
                            <div className="flex h-screen overflow-hidden">
                                <Sidebar />
                                <div className="flex-1 flex flex-col">
                                    <Navbar />
                                    <ChatPage />
                                </div>
                            </div>
                        </KeysGate>
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
    )
}


