import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type MinimalUser = {
    uid: string
    email: string | null
    displayName: string | null
}

type AuthContextValue = {
    user: MinimalUser | null
    isGuest: boolean
    loading: boolean
    loginWithGoogle: () => Promise<void>
    continueAsGuest: () => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<MinimalUser | null>(null)
    const [isGuest, setIsGuest] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    // Initialize Firebase app on client only (side-effect import to preserve exact snippet file)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('../firebase/firebaseConfig.js').then(() => {
                // After Firebase initializes, attach auth listener
                import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
                    const auth = getAuth()
                    onAuthStateChanged(auth, (fbUser) => {
                        if (fbUser) {
                            setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName })
                            setIsGuest(false)
                        } else {
                            const guest = localStorage.getItem('map_guest')
                            setIsGuest(!!guest)
                            setUser(null)
                        }
                        setLoading(false)
                    })
                })
            })
        }
    }, [])

    const loginWithGoogle = async () => {
        const [{ getAuth, signInWithPopup, GoogleAuthProvider }] = await Promise.all([
            import('firebase/auth'),
        ])
        const auth = getAuth()
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const continueAsGuest = () => {
        localStorage.setItem('map_guest', '1')
        setIsGuest(true)
        setUser(null)
    }

    const logout = async () => {
        const [{ getAuth, signOut }] = await Promise.all([import('firebase/auth')])
        localStorage.removeItem('map_guest')
        setIsGuest(false)
        try {
            const auth = getAuth()
            await signOut(auth)
        } catch {
            // ignore if not signed in
        }
        setUser(null)
    }

    const value = useMemo(
        () => ({ user, isGuest, loading, loginWithGoogle, continueAsGuest, logout }),
        [user, isGuest, loading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}


