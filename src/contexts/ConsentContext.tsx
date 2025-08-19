"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ANALYTICS_KEY = "mai:consent:analytics";

type ConsentState = "granted" | "denied" | null;

type ConsentContextValue = {
    analytics: ConsentState;
    setAnalytics: (state: Exclude<ConsentState, null>) => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function useConsent(): ConsentContextValue {
    const ctx = useContext(ConsentContext);
    if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
    return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
    const [analytics, setAnalyticsState] = useState<ConsentState>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(ANALYTICS_KEY) as ConsentState | null;
            if (saved === "granted" || saved === "denied") setAnalyticsState(saved);
            else setAnalyticsState("denied");
        } catch {
            setAnalyticsState("denied");
        }
    }, []);

    const setAnalytics = (state: Exclude<ConsentState, null>) => {
        setAnalyticsState(state);
        try {
            localStorage.setItem(ANALYTICS_KEY, state);
        } catch {}
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("consent", "update", { analytics_storage: state === "granted" ? "granted" : "denied" });
        }
    };

    const value = useMemo(() => ({ analytics, setAnalytics }), [analytics]);

    return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function isAnalyticsGranted(): boolean {
    try {
        return localStorage.getItem(ANALYTICS_KEY) === "granted";
    } catch {
        return false;
    }
}


