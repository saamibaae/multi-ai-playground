import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
    const { user, isGuest, continueAsGuest, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && (user || isGuest)) {
            navigate('/setup', { replace: true })
        }
    }, [user, isGuest, loading, navigate])

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow">
                <header className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold">Multi-AI Playground</h1>
                    <p className="text-gray-600">Sign in to sync settings, or continue locally.</p>
                </header>
                <div className="flex flex-col gap-3">
                    <GoogleLoginButton />
                    <button
                        type="button"
                        onClick={continueAsGuest}
                        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        Continue without sign in
                    </button>
                </div>
            </div>
        </main>
    )
}


