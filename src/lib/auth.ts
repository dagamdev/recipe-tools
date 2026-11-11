import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { account, session, user, verification } from '@/db/schema'

const googleId = process.env.GOOGLE_CLIENT_ID
const googleSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification }
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  },
  // Google solo se activa si están sus credenciales
  socialProviders: googleId !== undefined && googleSecret !== undefined
    ? { google: { clientId: googleId, clientSecret: googleSecret } }
    : {},
  // nextCookies permite iniciar sesión desde Server Actions
  plugins: [nextCookies()]
})

export const isGoogleEnabled = googleId !== undefined && googleSecret !== undefined

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
