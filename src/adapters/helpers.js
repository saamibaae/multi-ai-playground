export function withAbortTimeout(ms) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ms)
    const clear = () => clearTimeout(timer)
    return { controller, clear }
}

export async function safeJson(res) {
    try {
        return await res.json()
    } catch {
        return null
    }
}

export function now() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
}


