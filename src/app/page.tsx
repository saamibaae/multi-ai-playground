import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <div className="card max-w-xl p-8 text-center">
        <h1 className="text-3xl font-semibold">Multi-AI Playground</h1>
        <p className="mt-2 text-sm opacity-80">
          Compare responses from multiple AI models side by side.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/api-setup" className="rounded-full border border-black/10 px-5 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            API Setup
          </Link>
          <Link href="/chat" className="rounded-full bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-500 transition-colors">
            Open Playground
          </Link>
        </div>
      </div>
    </main>
  );
}


