import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isBrowser = typeof window !== 'undefined'
const hasCoreConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
)

let app = null
if (isBrowser && hasCoreConfig) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

export const auth = isBrowser && app ? getAuth(app) : {}
export const googleProvider = isBrowser && app ? new GoogleAuthProvider() : {}
export const db = isBrowser && app ? getFirestore(app) : {}
export let analytics = null
    ; (async () => {
        try {
            if (app && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && (await analyticsSupported())) {
                analytics = getAnalytics(app)
            }
        } catch { }
    })()
export default app


