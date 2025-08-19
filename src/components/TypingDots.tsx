"use client";

import React from "react";

export function TypingDots() {
    return (
        <span aria-label="typing" role="status" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: "#9ca3af", display: "inline-block", animation: `bump 1s ease ${i * 0.12}s infinite` }} />
            ))}
            <style>{`@keyframes bump{0%,80%,100%{transform:translateY(0);opacity:.6}40%{transform:translateY(-3px);opacity:1}}`}</style>
        </span>
    );
}


