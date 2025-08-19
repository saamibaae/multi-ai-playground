"use client";

import { getFirestoreDb } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { EncryptedString } from "@/lib/crypto";

export type SyncedProviderKeys = {
    openai?: EncryptedString;
    gemini?: EncryptedString;
    deepseek?: EncryptedString;
    zai?: EncryptedString;
};

export async function fetchSyncedKeys(userId: string): Promise<SyncedProviderKeys | null> {
    const db = getFirestoreDb();
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return (data?.apiKeysEncrypted as SyncedProviderKeys) || null;
}

export async function upsertSyncedKeys(userId: string, payload: SyncedProviderKeys): Promise<void> {
    const db = getFirestoreDb();
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, { apiKeysEncrypted: payload, updatedAt: Date.now() });
    } else {
        await updateDoc(ref, { apiKeysEncrypted: payload, updatedAt: Date.now() });
    }
}


