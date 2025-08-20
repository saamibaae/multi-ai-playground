import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Prevent Firebase from initializing real Auth in tests by mocking utils/firebase
vi.mock('./src/utils/firebase.js', () => {
    return {
        auth: {},
        googleProvider: {},
    }
})


