import React from 'react'
import { LogOut } from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'

export default function Navbar() {
    const { logout } = useAuth()
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="font-semibold">Multi AI Playground</div>
            <button className="inline-flex items-center gap-2 text-sm" onClick={logout}>
                <LogOut size={16} /> Logout
            </button>
        </div>
    )
}


