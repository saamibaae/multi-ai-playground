import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function GoogleLoginButton() {
    const { loginWithGoogle } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        try {
            setLoading(true)
            await loginWithGoogle()
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            aria-label="Sign in with Google"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9.818v4.364h6.136c-.272 1.59-1.864 4.659-6.136 4.659a7.091 7.091 0 1 1 0-14.182 6.46 6.46 0 0 1 4.545 1.773l3.182-3.182A10.91 10.91 0 0 0 12 1.091C5.864 1.091.909 6.045.909 12.182S5.864 23.273 12 23.273c6.545 0 10.909-4.591 10.909-11.045 0-.682-.068-1.227-.159-1.773H12Z" fill="#fff" />
            </svg>
            {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
    )
}


