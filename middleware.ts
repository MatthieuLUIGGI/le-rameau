import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.next();
    }

    const response = await updateSession(request)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: () => { },
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;
    const isPublic = path === '/' || path === '/login' || path === '/register';

    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && (path === '/login' || path === '/register')) {
        return NextResponse.redirect(new URL('/accueil', request.url))
    }

    if (path.startsWith('/admin') && !path.startsWith('/admin/board') && user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.redirect(new URL('/accueil', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
