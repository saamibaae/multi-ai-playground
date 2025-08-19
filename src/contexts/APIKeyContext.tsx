"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AI_KEYS_STORAGE_KEY, getSavedApiKeys, type ProviderKeys } from "@/lib/api-keys";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSyncedKeys } from "@/lib/key-sync";

export type APIKeyContextValue = {
    keys: ProviderKeys;
    hasAny: boolean;
    enabledProviders: Array<keyof ProviderKeys>;
    synced: Partial<Record<keyof ProviderKeys, boolean>>;
    setKey: (id: keyof ProviderKeys, value: string) => void;
    removeKey: (id: keyof ProviderKeys) => void;
    refresh: () => void;
};

const APIKeyContext = createContext<APIKeyContextValue | undefined>(undefined);

export function useAPIKeys(): APIKeyContextValue {
    const ctx = useContext(APIKeyContext);
    if (!ctx) throw new Error("useAPIKeys must be used within APIKeyProvider");
    return ctx;
}

export function APIKeyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [keys, setKeys] = useState<ProviderKeys>({});
    const [synced, setSynced] = useState<Partial<Record<keyof ProviderKeys, boolean>>>({});

    function refresh() {
        setKeys(getSavedApiKeys());
    }

    useEffect(() => {
        refresh();
        const onStorage = (e: StorageEvent) => {
            if (e.key === null || e.key === AI_KEYS_STORAGE_KEY) refresh();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!user) return;
            const remote = await fetchSyncedKeys(user.uid);
            if (!mounted) return;
            const flags: Partial<Record<keyof ProviderKeys, boolean>> = {};
            if (remote?.openai) flags.openai = true;
            if (remote?.gemini) flags.gemini = true;
            if (remote?.deepseek) flags.deepseek = true;
            if (remote?.zai) flags.zai = true;
            setSynced(flags);
        })();
        return () => {
            mounted = false;
        };
    }, [user]);

    const value = useMemo<APIKeyContextValue>(() => {
        const enabled = ["openai", "gemini", "deepseek", "zai"].filter((k) => (keys as any)[k]) as Array<keyof ProviderKeys>;
        return {
            keys,
            hasAny: enabled.length > 0,
            enabledProviders: enabled,
            synced,
            setKey: (id, value) => {
                const next = { ...keys, [id]: value } as ProviderKeys;
                localStorage.setItem(AI_KEYS_STORAGE_KEY, JSON.stringify(next));
                setKeys(next);
            },
            removeKey: (id) => {
                const next = { ...keys } as ProviderKeys;
                delete (next as any)[id];
                localStorage.setItem(AI_KEYS_STORAGE_KEY, JSON.stringify(next));
                setKeys(next);
            },
            refresh,
        };
    }, [keys, synced]);

    return <APIKeyContext.Provider value={value}>{children}</APIKeyContext.Provider>;
}


