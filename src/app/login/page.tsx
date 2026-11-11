import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession, isGoogleConfigured } from '@/lib/auth'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage () {
  if (await getSession() !== null) redirect('/recetas')

  return (
    <main className='mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-10'>
      <div className='flex flex-col gap-3'>
        <div aria-hidden='true' className='flex size-12 items-center justify-center rounded-2xl bg-brand text-brand-ink'>
          <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round'><path d='M6 8h12M6 12h9M6 16h12' /></svg>
        </div>
        <h1 className='font-display text-4xl font-bold tracking-tight'>Escandallo</h1>
        <p className='text-base text-muted'>Registra lo que pagas por cada insumo y sabe al centavo cuánto te cuesta cada receta.</p>
      </div>
      <LoginForm googleConfigured={isGoogleConfigured} />
    </main>
  )
}
