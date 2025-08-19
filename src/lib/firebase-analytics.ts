"use client";

import { getFirebaseApp } from "@/lib/firebase";
import { getAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { isAnalyticsGranted } from "@/contexts/ConsentContext";

let initialized = false;

export async function initAnalytics() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const supported = await isSupported().catch(() => false);
  if (!supported) return;
  try {
    const app = getFirebaseApp();
    const analytics = getAnalytics(app);
    setAnalyticsCollectionEnabled(analytics, isAnalyticsGranted());
    initialized = true;
  } catch {
    // ignore
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  try {
    const app = getFirebaseApp();
    const analytics = getAnalytics(app);
    logEvent(analytics, event as any, params as any);
  } catch {
    // ignore
  }
}


