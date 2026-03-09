import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    if (typeof document === 'undefined') return []
                    return document.cookie.split(';').map(c => {
                        const [name, ...rest] = c.split('=')
                        return { name: name.trim(), value: decodeURIComponent(rest.join('=')) }
                    })
                },
                setAll(cookiesToSet) {
                    if (typeof document === 'undefined') return
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const { maxAge, expires, ...restOptions } = options

                        let cookieString = `${name}=${encodeURIComponent(value)}`

                        if (restOptions.domain) cookieString += `; Domain=${restOptions.domain}`
                        if (restOptions.path) cookieString += `; Path=${restOptions.path}`
                        if (maxAge === 0) cookieString += `; Max-Age=0`
                        if (restOptions.sameSite) cookieString += `; SameSite=${restOptions.sameSite}`
                        if (restOptions.secure) cookieString += `; Secure`

                        document.cookie = cookieString
                    })
                }
            }
        }
    )
}
