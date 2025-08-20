export function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch { }
}

export function load(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}


