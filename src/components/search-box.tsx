'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon } from './icons'

// Búsqueda que vive en la URL (?q=) para poder compartir y volver atrás
export function SearchBox ({ label, placeholder }: { label: string, placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params)
      if (value.trim() === '') next.delete('q')
      else next.set('q', value.trim())
      if (next.toString() !== params.toString()) {
        router.replace(`${pathname}${next.size > 0 ? `?${next.toString()}` : ''}`, { scroll: false })
      }
    }, 250)
    return () => { clearTimeout(timer) }
  }, [value, params, pathname, router])

  return (
    <label className='flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20'>
      <SearchIcon size={18} className='shrink-0 text-muted' />
      <span className='sr-only'>{label}</span>
      <input type='search' value={value} onChange={e => { setValue(e.target.value) }} placeholder={placeholder}
        className='h-full w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted' />
    </label>
  )
}
