import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useApiKeys } from '../context/ApiKeyContext.jsx'

export default function Login() {
    const { user, signInWithGoogle } = useAuthContext()
    const { hasAnyKey } = useApiKeys()
    if (user) return <Navigate to={hasAnyKey ? '/chat' : '/apikey'} replace />
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="card max-w-md w-full text-center">
                <h1 className="text-xl font-semibold">Multi AI Playground</h1>
                <p className="mt-2 text-base text-neutral-600">Sign in to continue</p>
                <button className="mt-6 rounded-lg bg-blue-600 text-white px-4 py-2" onClick={signInWithGoogle}>
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}


