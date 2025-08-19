"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <header style={{
            position: "sticky",
            top: 0,
            backdropFilter: "saturate(180%) blur(8px)",
            background: "color-mix(in hsl, Canvas 85%, black 15%)",
            borderBottom: "1px solid #e5e7eb",
            zIndex: 20,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", maxWidth: 1100, margin: "0 auto" }}>
                <div onClick={() => router.push("/home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <span style={{ fontWeight: 800 }}>Multi-AI</span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <ThemeToggle />
                    <button
                        onClick={async () => {
                            await logout();
                            // Hard redirect to ensure clean state
                            window.location.href = "/login";
                        }}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontWeight: 600 }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}


