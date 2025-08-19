import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Multi-AI Playground",
  description: "Chat with multiple AI models side by side",
  metadataBase: new URL("https://multi-ai-playground.web.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
        <div id="portal-root" />
      </body>
    </html>
  );
}


