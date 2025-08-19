"use client";
import ApiKeyForm from "@/components/ApiKeyForm";

export default function ApiSetupPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">API Setup</h1>
      <p className="mt-1 text-sm opacity-80">Enter your API keys. They are stored locally in your browser.</p>
      <div className="mt-6">
        <ApiKeyForm />
      </div>
    </main>
  );
}


