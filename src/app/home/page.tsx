"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasAnyApiKey } from "@/lib/api-keys";

type CardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    tooltip?: string;
    role?: string;
    ariaLabel?: string;
};

function BigCard({ title, description, icon, onClick, disabled, tooltip, role, ariaLabel }: CardProps) {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label={ariaLabel || title}
            role={(role as any) || "button"}
            title={disabled && tooltip ? tooltip : undefined}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                minHeight: 200,
                padding: 24,
                borderRadius: 20,
                border: "1px solid #e5e7eb",
                background: disabled ? "#f9fafb" : "white",
                color: "#111827",
                textAlign: "left",
                boxShadow: hover && !disabled ? "0 20px 40px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.06)",
                transform: hover && !disabled ? "translateY(-2px)" : "none",
                transition: "box-shadow .2s ease, transform .2s ease, background-color .2s ease",
                outline: "none",
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div aria-hidden style={{ width: 44, height: 44 }}>{icon}</div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{title}</div>
                    <div style={{ color: "#6b7280" }}>{description}</div>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: disabled ? "#9ca3af" : "#111827" }}>
                <span>Open</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </div>
            <span
                className="focus-ring"
                style={{
                    position: "absolute",
                    clipPath: "inset(0 0 0 0)",
                    height: 1,
                    width: 1,
                    overflow: "hidden",
                }}
            >

            </span>
        </button>
    );
}

export default function Home() {
    const router = useRouter();
    const [hasKeys, setHasKeys] = useState<boolean>(false);

    useEffect(() => {
        setHasKeys(hasAnyApiKey());
        const onStorage = (e: StorageEvent) => {
            if (e.key === null || e.key === "mai:api-keys") setHasKeys(hasAnyApiKey());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const cards = useMemo(
        () => [
            {
                title: "API Setup",
                description: "Add your provider API keys to get started.",
                icon: (
                    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#111827" strokeWidth="1.5"><path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z" /><path d="M12 12l9-4.5" /></svg>
                ),
                onClick: () => navigateWithTransition("/api-setup"),
                disabled: false,
            },
            {
                title: "Playground",
                description: hasKeys ? "Try multiple AI providers side-by-side." : "Add a key to unlock the playground.",
                icon: (
                    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#111827" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></svg>
                ),
                onClick: hasKeys ? () => navigateWithTransition("/chat") : undefined,
                disabled: !hasKeys,
                tooltip: !hasKeys ? "Add at least one API key to continue" : undefined,
            },
        ],
        [hasKeys]
    );

    function navigateWithTransition(path: string) {
        const main = document.querySelector("main");
        if (main) {
            (main as HTMLElement).animate(
                [
                    { opacity: 1, transform: "translateY(0px)" },
                    { opacity: 0, transform: "translateY(8px)" },
                ],
                { duration: 160, easing: "ease" }
            ).finished.then(() => router.push(path));
        } else {
            router.push(path);
        }
    }

    return (
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, animation: "fadeIn .24s ease both" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>Welcome</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0,1fr))", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {cards.map((c) => (
                        <BigCard key={c.title} {...c} />
                    ))}
                </div>
                <div style={{
                    marginTop: 8,
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    color: "#111827",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111827" strokeWidth="1.5"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" /><path d="M12 22V12" /><path d="M3 7l9 5 9-5" /></svg>
                        <strong>Help & Docs</strong>
                    </div>
                    <p style={{ color: "#6b7280", marginTop: 6 }}>Read setup instructions and provider tips in the README.</p>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
                button:focus-visible{outline: 3px solid #6366f1; outline-offset: 3px}
            `}</style>
        </main>
    );
}


