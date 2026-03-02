import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Protect coach and client routes: require auth
  if (pathname.startsWith('/coach') || pathname.startsWith('/client')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Optional: redirect authenticated users from / to role-based dashboard
  if (pathname === '/' && session) {
    // We don't have role in middleware without an extra request; redirect to login page
    // which will then redirect to dashboard. Or we could redirect to a generic /dashboard
    // that redirects by role. Keep it simple: redirect to /coach/dashboard and let
    // the app redirect clients from there if needed. Better: redirect to /login?redirect=
    // and let callback handle it. Simplest: do nothing for / so they see landing.
    // Plan said "optionally redirect / to role-based dashboard" - we need role.
    // Skip redirect for / to avoid extra DB call in middleware; layouts can handle.
  }

  return response
}

export const config = {
  matcher: [
    '/coach/:path*',
    '/client/:path*',
  ],
}
