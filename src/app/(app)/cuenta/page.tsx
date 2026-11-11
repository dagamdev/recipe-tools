import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { loadWorkspace } from '@/lib/data'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { pluralize } from '@/lib/format'
import { getThemePreference } from '@/lib/theme-server'
import { InstallApp } from './install-app'
import { SignOutButton } from './sign-out-button'

export const metadata: Metadata = { title: 'Cuenta' }

export default async function AccountPage () {
  const current = await getSession()
  if (current === null) redirect('/login')
  const ws = await loadWorkspace(current.user.id)

  return (
    <main className='flex flex-col gap-4 px-5 pt-7'>
      <header className='flex flex-col gap-0.5'>
        <span className='text-sm font-medium text-muted'>Tu cuenta</span>
        <h1 className='font-display text-[32px] leading-tight font-bold tracking-tight'>{current.user.name}</h1>
      </header>
      <section className='flex flex-col gap-1 rounded-[20px] border border-line bg-surface p-4'>
        <span className='text-xs font-medium text-muted'>Correo</span>
        <span className='text-[15px] font-semibold break-all'>{current.user.email}</span>
      </section>
      <section className='grid grid-cols-2 gap-2.5'>
        <div className='rounded-[18px] border border-line bg-surface px-4 py-3.5 text-sm'>{pluralize(ws.recipes.length, 'receta', 'recetas')}</div>
        <div className='rounded-[18px] border border-line bg-surface px-4 py-3.5 text-sm'>{pluralize(ws.products.length, 'insumo', 'insumos')}</div>
      </section>
      <section aria-labelledby='theme-title' className='flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-4'>
        <div className='flex flex-col gap-0.5'>
          <h2 id='theme-title' className='text-sm font-semibold'>Apariencia</h2>
          <p className='text-xs text-muted'>Sistema usa el modo claro u oscuro de tu dispositivo.</p>
        </div>
        <ThemeSwitcher initial={await getThemePreference()} />
      </section>
      <InstallApp />
      <SignOutButton />
    </main>
  )
}
