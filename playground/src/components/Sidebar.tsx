import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const { pathname } = useLocation()
    const link = (to: string, label: string) => (
        <Link
            to={to}
            className={
                'block rounded px-3 py-2 text-sm ' + (pathname === to ? 'bg-gray-900 text-white' : 'hover:bg-gray-100')
            }
        >
            {label}
        </Link>
    )
    return (
        <aside className="hidden lg:block w-56 shrink-0 border-r p-3 sticky top-0 h-screen">
            <nav className="space-y-1">
                {link('/chat', 'New Chat')}
                {link('/setup', 'API Keys')}
                {link('/login', 'Login')}
            </nav>
        </aside>
    )
}


