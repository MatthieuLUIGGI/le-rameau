import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return supabaseResponse;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const { maxAge, expires, ...restOptions } = options
                        const finalOptions = maxAge === 0 ? { ...restOptions, maxAge: 0 } : restOptions
                        supabaseResponse.cookies.set(name, value, finalOptions)
                    })
                },
            },
        }
    )

    await supabase.auth.getUser()

    return supabaseResponse
}
