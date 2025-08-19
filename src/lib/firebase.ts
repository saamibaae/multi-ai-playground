"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    type User,
    type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
};

const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

function ensureInitialized() {
    if (!app) {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        // Persist session across refreshes in the browser
        setPersistence(auth, browserLocalPersistence).catch(() => {
            /* no-op */
        });
        db = getFirestore(app);

        // Analytics only on client and when supported
        if (typeof window !== "undefined") {
            void isSupported()
                .then((supported) => {
                    if (supported) {
                        try {
                            analytics = getAnalytics(app);
                        } catch {
                            analytics = null;
                        }
                    }
                })
                .catch(() => {
                    /* ignore */
                });
        }
    }
}

export function getFirebaseApp(): FirebaseApp {
    ensureInitialized();
    return app;
}

export function getFirebaseAuth(): Auth {
    ensureInitialized();
    return auth;
}

export function getFirestoreDb(): Firestore {
    ensureInitialized();
    return db;
}

export function getFirebaseAnalytics(): Analytics | null {
    ensureInitialized();
    return analytics;
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
    const a = getFirebaseAuth();
    const res = await signInWithPopup(a, provider);
    return res.user;
}

export async function signOutUser(): Promise<void> {
    const a = getFirebaseAuth();
    await firebaseSignOut(a);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
    const a = getFirebaseAuth();
    return onAuthStateChanged(a, callback);
}

export type { User };


