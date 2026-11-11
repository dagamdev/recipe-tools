'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { applyTheme, readThemePreference, setThemePreference, subscribeTheme, type ThemePreference } from '@/lib/theme'
import { cx } from './ui'

const OPTIONS: Array<{ value: ThemePreference, label: string, icon: React.ReactNode }> = [
  {
    value: 'system',
    label: 'Sistema',
    icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><rect x='5' y='2' width='14' height='20' rx='2' /><path d='M12 18h.01' /></svg>
  },
  {
    value: 'light',
    label: 'Claro',
    icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' aria-hidden='true'><circle cx='12' cy='12' r='4' /><path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' /></svg>
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z' /></svg>
  }
]

// En el servidor no se conoce la preferencia: se asume 'system' y se corrige al hidratar
const getServerSnapshot = (): ThemePreference => 'system'

export function ThemeSwitcher ({ className }: { className?: string }) {
  const preference = useSyncExternalStore(subscribeTheme, readThemePreference, getServerSnapshot)

  return (
    <div role='radiogroup' aria-label='Tema' className={cx('grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1', className)}>
      {OPTIONS.map(option => {
        const active = preference === option.value
        return (
          <button key={option.value} type='button' role='radio' aria-checked={active}
            onClick={() => { setThemePreference(option.value) }}
            className={cx('flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition',
              active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')}>
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// Sincroniza el color de la barra del navegador con la preferencia guardada al cargar
export function ThemeSync () {
  useEffect(() => { applyTheme(readThemePreference()) }, [])
  return null
}
