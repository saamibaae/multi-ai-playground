export function withAbortTimeout(ms: number) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), ms)
    const clear = () => clearTimeout(timer)
    return { controller, clear }
}

export async function safeJson(res: Response) {
    try {
        return await res.json()
    } catch {
        return null
    }
}

export function now() {
    return performance?.now?.() ?? Date.now()
}


