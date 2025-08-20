import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { useApiKeys } from '../../context/ApiKeyContext.jsx'

export default function LoginPage() {
    const { user, signInWithGoogle } = useAuth()
    const { hasAnyKey } = useApiKeys()
    if (user) return <Navigate to={hasAnyKey ? '/chat' : '/apikey'} replace />

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="card max-w-md w-full text-center">
                <h1 className="text-xl font-semibold">Multi AI Playground</h1>
                <p className="mt-2 text-base text-neutral-600">Sign in to continue</p>
                <button
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
                    onClick={signInWithGoogle}
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}


