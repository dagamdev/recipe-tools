'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BasketIcon, BookIcon, UserIcon } from './icons'
import { cx } from './ui'

const tabs = [
  { href: '/', label: 'Recetas', Icon: BookIcon, match: (p: string) => p === '/' || p.startsWith('/recetas') },
  { href: '/insumos', label: 'Insumos', Icon: BasketIcon, match: (p: string) => p.startsWith('/insumos') },
  { href: '/cuenta', label: 'Cuenta', Icon: UserIcon, match: (p: string) => p.startsWith('/cuenta') }
]

export function TabBar () {
  const pathname = usePathname()
  // En el detalle de receta la barra de acción ocupa ese espacio
  if (pathname.startsWith('/recetas/')) return null

  return (
    <nav aria-label='Principal' className='fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]'>
      <ul className='mx-auto grid max-w-xl grid-cols-3 px-6 pt-2 pb-3'>
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? 'page' : undefined}
                className={cx('flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs', active ? 'font-semibold text-brand' : 'font-medium text-muted')}>
                <Icon />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
