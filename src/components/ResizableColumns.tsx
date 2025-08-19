"use client";

import React, { useEffect, useRef, useState } from "react";

type ResizableProps = {
    children: React.ReactNode[];
};

export function ResizableColumns({ children }: ResizableProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [widths, setWidths] = useState<number[]>(() => new Array(children.length).fill(1 / children.length));

    useEffect(() => {
        setWidths(new Array(children.length).fill(1 / children.length));
    }, [children.length]);

    function startDrag(index: number, e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        const startX = e.clientX;
        const container = containerRef.current!;
        const rect = container.getBoundingClientRect();
        const totalWidth = rect.width;
        const initial = [...widths];
        function onMove(ev: MouseEvent) {
            const dx = ev.clientX - startX;
            const delta = dx / totalWidth;
            const left = Math.max(0.15, Math.min(0.85, initial[index] + delta));
            const right = Math.max(0.15, Math.min(0.85, initial[index + 1] - delta));
            const next = [...initial];
            next[index] = left;
            next[index + 1] = right;
            setWidths(next);
        }
        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    return (
        <div ref={containerRef} style={{ display: "grid", gridTemplateColumns: widths.map((w) => `${w}fr`).join(" "), gap: 8, alignItems: "stretch" }}>
            {children.map((child, i) => (
                <React.Fragment key={i}>
                    <div style={{ minWidth: 0 }}>{child}</div>
                    {i < children.length - 1 ? (
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            onMouseDown={(e) => startDrag(i, e)}
                            style={{ cursor: "col-resize", width: 6, background: "#f3f4f6", borderRadius: 999 }}
                            title="Drag to resize"
                        />
                    ) : null}
                </React.Fragment>
            ))}
        </div>
    );
}


