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
  // Sin sesión también deben cargar el login, la autenticación y los archivos de la PWA
  matcher: ['/((?!login|api/auth|_next|icon.svg|favicon.ico|manifest.webmanifest|sw.js|offline.html|icons/).*)']
}
