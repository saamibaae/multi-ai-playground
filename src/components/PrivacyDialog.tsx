"use client";

import React, { useState } from "react";
import { useConsent } from "@/contexts/ConsentContext";

export function PrivacyDialog() {
  const { analytics, setAnalytics } = useConsent();
  const [open, setOpen] = useState(analytics === "denied");

  if (analytics === null) return null;

  return open ? (
    <div role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg rounded-lg border bg-card text-card-foreground shadow-lg p-6">
        <h2 id="privacy-title" className="text-xl font-semibold">Privacy</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your provider API keys and chats are stored locally by default. You can opt-in to sync encrypted keys and sessions to your account via Firestore.
        </p>
        <div className="mt-4 grid gap-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={analytics === "granted"}
              onChange={(e) => setAnalytics(e.target.checked ? "granted" : "denied")}
            />
            Allow anonymous analytics (Firebase Analytics)
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md border" onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  ) : null;
}


