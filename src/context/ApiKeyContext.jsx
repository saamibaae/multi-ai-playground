import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../utils/firebase.js'
import { useAuthContext } from './AuthContext.jsx'

const STORAGE_KEY = 'multi-ai-keys' // Fallback for localStorage when offline

const defaultState = {
    openai: '',
    gemini: '',
    anthropic: '',
    zhipu: '',
    hidden: {
        openai: false,
        gemini: false,
        anthropic: false,
        zhipu: false,
        custom: false,
    },
}

const ApiKeyContext = createContext(null)

export function ApiKeysProvider({ children }) {
    const [keys, setKeys] = useState(defaultState)
    const [loading, setLoading] = useState(true)
    const { user } = useAuthContext()

    // Load keys from Firebase when user is authenticated
    useEffect(() => {
        if (!user) {
            // If no user, try to load from localStorage as fallback
            try {
                const raw = localStorage.getItem(STORAGE_KEY)
                if (raw) setKeys({ ...defaultState, ...JSON.parse(raw) })
            } catch { }
            setLoading(false)
            return
        }

        // Load from Firebase
        const loadKeys = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'apiKeys')
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const firebaseKeys = docSnap.data()
                    setKeys({ ...defaultState, ...firebaseKeys })
                } else {
                    // Try localStorage as fallback and migrate to Firebase
                    try {
                        const raw = localStorage.getItem(STORAGE_KEY)
                        if (raw) {
                            const localKeys = JSON.parse(raw)
                            setKeys({ ...defaultState, ...localKeys })
                            // Migrate to Firebase
                            await setDoc(docRef, localKeys)
                            localStorage.removeItem(STORAGE_KEY) // Clean up after migration
                        }
                    } catch { }
                }
            } catch (error) {
                console.error('Error loading API keys from Firebase:', error)
                // Fallback to localStorage
                try {
                    const raw = localStorage.getItem(STORAGE_KEY)
                    if (raw) setKeys({ ...defaultState, ...JSON.parse(raw) })
                } catch { }
            } finally {
                setLoading(false)
            }
        }

        loadKeys()
    }, [user])

    // Save keys to Firebase when they change (and user is authenticated)
    useEffect(() => {
        if (!user || loading) return

        const saveKeys = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'apiKeys')
                await setDoc(docRef, keys)

                // Also save to localStorage as backup
                localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
            } catch (error) {
                console.error('Error saving API keys to Firebase:', error)
                // Fallback to localStorage only
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
                } catch { }
            }
        }

        // Don't save default state on initial load
        if (keys !== defaultState) {
            saveKeys()
        }
    }, [keys, user, loading])

    const hasAnyKey = !!(keys.openai || keys.gemini || keys.anthropic || keys.zhipu || keys.customBase)

    const clearKeys = async () => {
        const newKeys = defaultState
        setKeys(newKeys)

        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'apiKeys')
                await deleteDoc(docRef)
            } catch (error) {
                console.error('Error clearing API keys from Firebase:', error)
            }
        }

        // Also clear localStorage
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch { }
    }

    const value = useMemo(
        () => ({ keys, setKeys, hasAnyKey, clearKeys, loading }),
        [keys, hasAnyKey, loading]
    )

    return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
}

export function useApiKeys() {
    return useContext(ApiKeyContext)
}


