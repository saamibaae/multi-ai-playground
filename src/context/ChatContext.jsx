import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../utils/firebase.js'
import { useAuthContext } from './AuthContext.jsx'

const STORAGE_KEY = 'multi-ai-chats' // Fallback for localStorage when offline

const ChatContext = createContext(null)

function createNewChat() {
    return {
        id: crypto.randomUUID(),
        title: 'New Chat',
        createdAt: Date.now(),
        messages: [],
    }
}

export function ChatProvider({ children }) {
    const [chats, setChats] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuthContext()

    // Load chats from Firebase when user is authenticated
    useEffect(() => {
        if (!user) {
            // If no user, try to load from localStorage as fallback
            try {
                const raw = localStorage.getItem(STORAGE_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw)
                    setChats(parsed.chats || [])
                    setActiveChatId(parsed.activeChatId || null)
                } else {
                    const chat = createNewChat()
                    setChats([chat])
                    setActiveChatId(chat.id)
                }
            } catch {
                const chat = createNewChat()
                setChats([chat])
                setActiveChatId(chat.id)
            }
            setLoading(false)
            return
        }

        // Load from Firebase
        const loadChats = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'chatData')
                const docSnap = await getDoc(docRef)
                
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setChats(data.chats || [])
                    setActiveChatId(data.activeChatId || null)
                } else {
                    // Try localStorage as fallback and migrate to Firebase
                    try {
                        const raw = localStorage.getItem(STORAGE_KEY)
                        if (raw) {
                            const parsed = JSON.parse(raw)
                            const chatsData = {
                                chats: parsed.chats || [],
                                activeChatId: parsed.activeChatId || null
                            }
                            setChats(chatsData.chats)
                            setActiveChatId(chatsData.activeChatId)
                            // Migrate to Firebase
                            await setDoc(docRef, chatsData)
                            localStorage.removeItem(STORAGE_KEY) // Clean up after migration
                        } else {
                            // Create new chat if no data exists
                            const chat = createNewChat()
                            setChats([chat])
                            setActiveChatId(chat.id)
                            await setDoc(docRef, { chats: [chat], activeChatId: chat.id })
                        }
                    } catch {
                        const chat = createNewChat()
                        setChats([chat])
                        setActiveChatId(chat.id)
                    }
                }
            } catch (error) {
                console.error('Error loading chats from Firebase:', error)
                // Fallback to localStorage
                try {
                    const raw = localStorage.getItem(STORAGE_KEY)
                    if (raw) {
                        const parsed = JSON.parse(raw)
                        setChats(parsed.chats || [])
                        setActiveChatId(parsed.activeChatId || null)
                    } else {
                        const chat = createNewChat()
                        setChats([chat])
                        setActiveChatId(chat.id)
                    }
                } catch {
                    const chat = createNewChat()
                    setChats([chat])
                    setActiveChatId(chat.id)
                }
            } finally {
                setLoading(false)
            }
        }

        loadChats()
    }, [user])

    // Save chats to Firebase when they change (and user is authenticated)
    useEffect(() => {
        if (!user || loading) return

        const saveChats = async () => {
            try {
                const docRef = doc(db, 'users', user.uid, 'settings', 'chatData')
                const chatData = { chats, activeChatId }
                await setDoc(docRef, chatData)
                
                // Also save to localStorage as backup
                localStorage.setItem(STORAGE_KEY, JSON.stringify(chatData))
            } catch (error) {
                console.error('Error saving chats to Firebase:', error)
                // Fallback to localStorage only
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeChatId }))
                } catch { }
            }
        }

        // Don't save on initial load
        if (chats.length > 0) {
            saveChats()
        }
    }, [chats, activeChatId, user, loading])

    function newChat() {
        const chat = createNewChat()
        setChats((prev) => [chat, ...prev])
        setActiveChatId(chat.id)
        return chat.id
    }

    function deleteChat(id) {
        setChats((prev) => prev.filter((c) => c.id !== id))
        if (activeChatId === id) {
            const next = chats.find((c) => c.id !== id)
            setActiveChatId(next ? next.id : null)
        }
    }

    function appendMessage(role, content, meta = {}) {
        const ensureTargetId = activeChatId || newChat()
        setChats((prev) =>
            prev.map((c) => {
                if (c.id !== ensureTargetId) return c
                const messages = [...c.messages, { id: (crypto?.randomUUID?.() || String(Date.now() + Math.random())), role, content, createdAt: Date.now(), ...meta }]
                const title = c.title === 'New Chat' && role === 'user' ? content.slice(0, 32) : c.title
                return { ...c, messages, title }
            })
        )
    }

    const activeChat = chats.find((c) => c.id === activeChatId) || null

    const value = useMemo(
        () => ({ chats, activeChat, activeChatId, setActiveChatId, newChat, deleteChat, appendMessage, setChats, loading }),
        [chats, activeChat, activeChatId, loading]
    )

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
    return useContext(ChatContext)
}


