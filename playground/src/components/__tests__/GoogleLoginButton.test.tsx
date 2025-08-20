import { expect, test } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import GoogleLoginButton from '../../components/GoogleLoginButton'
import { AuthProvider } from '../../contexts/AuthContext'

test('renders Google login button', async () => {
    render(
        <AuthProvider>
            <GoogleLoginButton />
        </AuthProvider>
    )
    await waitFor(async () => {
        expect(await screen.findByRole('button', { name: /sign in with google/i })).not.toBeNull()
    })
})



