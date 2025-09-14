import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value

  if (!token && req.nextUrl.pathname.startsWith('/buyers')) {
    // Redirect to login if not authenticated and accessing protected route
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/buyers/:path*', '/api/buyers/:path*'],
}
