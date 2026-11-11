import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Revisión rápida por cookie. La validación real de la sesión se hace en el servidor.
export function proxy (request: NextRequest) {
  const hasSession = getSessionCookie(request) !== null

  // Portada: pública; con sesión se va directo a la app
  if (request.nextUrl.pathname === '/') {
    return hasSession ? NextResponse.redirect(new URL('/recetas', request.url)) : NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Sin sesión también deben cargar el login, la autenticación y los archivos de la PWA
  matcher: ['/((?!login|api/auth|_next|icon.svg|favicon.ico|manifest.webmanifest|sw.js|offline.html|icons/|robots.txt|opengraph-image).*)']
}
