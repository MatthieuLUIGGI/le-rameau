import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { UserRole } from './lib/types/roles'

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

    // Routes API publiques — liste explicite (évite d'exposer toutes les routes /api/ sans auth)
    const PUBLIC_API_ROUTES = ['/api/cron/check-expirations', '/api/clean-logs'];
    const isPublic = path === '/' || path === '/login' || path === '/register'
        || PUBLIC_API_ROUTES.includes(path)
        || path === '/conditions-generales' || path === '/confidentialite' || path === '/mentions-legales';


    if (!user && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && (path === '/login' || path === '/register')) {
        return NextResponse.redirect(new URL('/accueil', request.url))
    }

    if (path.startsWith('/admin') && !path.startsWith('/admin/board') && user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== UserRole.ADMIN && profile?.role !== UserRole.SUPER_ADMIN) {
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
