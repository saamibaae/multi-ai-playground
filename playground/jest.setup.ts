import '@testing-library/jest-dom'

// Mock Firebase modules to avoid analytics/auth side effects in tests
jest.mock('firebase/app', () => ({ initializeApp: () => ({}) }))
jest.mock('firebase/analytics', () => ({ getAnalytics: () => ({}) }))
jest.mock('firebase/auth', () => ({
    getAuth: () => ({}),
    onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => cb(null),
    signInWithPopup: () => Promise.resolve({}),
    GoogleAuthProvider: class { },
}))


