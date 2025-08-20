import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ProviderId } from '../types/providers'
export type { ProviderId } from '../types/providers'

export type ProviderConfig = {
    id: ProviderId
    label: string
    apiKey: string
    baseUrl?: string
    model?: string
    active?: boolean
}

type ApiKeysContextValue = {
    providers: Record<ProviderId, ProviderConfig | undefined>
    saveProvider: (config: ProviderConfig) => void
    removeProvider: (id: ProviderId) => void
}

const ApiKeysContext = createContext<ApiKeysContextValue | undefined>(undefined)

const STORAGE_KEY = 'map_providers_v1'

export function ApiKeysProvider({ children }: { children: React.ReactNode }) {
    const [providers, setProviders] = useState<Record<ProviderId, ProviderConfig | undefined>>({
        openai: undefined,
        gemini: undefined,
        anthropic: undefined,
        generic: undefined,
    })

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
            try {
                const parsed = JSON.parse(raw)
                setProviders(parsed)
            } catch {
                // ignore
            }
        }
    }, [])

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(providers))
        } catch {
            // ignore
        }
    }, [providers])

    const hasAnyKey = useMemo(() => {
        return Object.values(providers).some((p) => !!p?.apiKey)
    }, [providers])

    const saveProvider = (config: ProviderConfig) => {
        setProviders((prev) => ({ ...prev, [config.id]: config }))
    }

    const removeProvider = (id: ProviderId) => {
        setProviders((prev) => ({ ...prev, [id]: undefined }))
    }

    const value = useMemo(() => ({ providers, saveProvider, removeProvider }), [providers])

    return <ApiKeysContext.Provider value={value}>{children}</ApiKeysContext.Provider>
}

export const useApiKeys = () => {
    const ctx = useContext(ApiKeysContext)
    if (!ctx) throw new Error('useApiKeys must be used within ApiKeysProvider')
    return ctx
}


