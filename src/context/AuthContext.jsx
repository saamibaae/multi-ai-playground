import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, googleProvider } from '../utils/firebase.js'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsub = () => { }
        try {
            unsub = onAuthStateChanged(auth, (u) => {
                setUser(u)
                setLoading(false)
            })
        } catch {
            setLoading(false)
        }
        // Safety: ensure we don't hang on blank screen
        const safety = setTimeout(() => setLoading((v) => (v ? false : v)), 1500)
        return () => {
            try { unsub?.() } catch { }
            clearTimeout(safety)
        }
    }, [])

    const value = useMemo(
        () => ({
            user,
            loading,
            signInWithGoogle: () => signInWithPopup(auth, googleProvider),
            logout: () => signOut(auth),
        }),
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    return useContext(AuthContext)
}


