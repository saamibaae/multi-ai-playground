import type { Metadata } from "next";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Multi-AI Playground",
  description: "Chat with multiple AI providers in one place",
};

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname && !pathname.startsWith("/login");
  return (
    <div>
      {showNavbar ? <Navbar /> : null}
      {children}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthGate>
              <Shell>{children}</Shell>
            </AuthGate>
          </AuthProvider>
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
