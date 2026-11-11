import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Revisión rápida: sin cookie de sesión, al login. La validación real se hace en el servidor.
export function proxy (request: NextRequest) {
  if (getSessionCookie(request) === null) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!login|api/auth|_next|icon.svg|favicon.ico).*)']
}
