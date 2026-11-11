import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { account, session, user, verification } from '@/db/schema'

const googleId = process.env.GOOGLE_CLIENT_ID ?? ''
const googleSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''

// Sin credenciales de Google no hay forma de entrar: la pantalla de login lo indica
export const isGoogleConfigured = googleId !== '' && googleSecret !== ''

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification }
  }),
  // Solo Google: sin correo y contraseña
  emailAndPassword: { enabled: false },
  socialProviders: isGoogleConfigured
    ? { google: { clientId: googleId, clientSecret: googleSecret, prompt: 'select_account' } }
    : {},
  // nextCookies permite que las Server Actions lean y escriban la sesión
  plugins: [nextCookies()]
})

// Sesión actual, cacheada por petición
export const getSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() })
})

// Para páginas y acciones que requieren usuario: devuelve su id o redirige al login
export async function requireUserId (): Promise<string> {
  const current = await getSession()
  if (current === null) redirect('/login')
  return current.user.id
}
