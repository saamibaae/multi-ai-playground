"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

const PROTECTED_ROUTES = new Set(["/home", "/api-setup", "/chat"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isProtected = pathname ? [...PROTECTED_ROUTES].some((p) => pathname.startsWith(p)) : false;

    useEffect(() => {
        if (loading) return;
        if (isProtected && !user) {
            router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        }
    }, [isProtected, user, loading, pathname, router]);

    if (isProtected && loading) {
        return (
            <div style={{ display: "grid", placeItems: "center", minHeight: "100svh" }}>
                <div style={{ width: 320, height: 120, borderRadius: 12, background: "#1112", backdropFilter: "blur(8px)", display: "grid", placeItems: "center" }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #999", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}


