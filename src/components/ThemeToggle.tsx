"use client";

import { useTheme } from "next-themes";
import React from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "transparent" }}
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}


