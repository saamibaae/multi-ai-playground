"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeToAuthState, signOutUser, type User } from "@/lib/firebase";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToAuthState((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, logout: () => signOutUser() }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


