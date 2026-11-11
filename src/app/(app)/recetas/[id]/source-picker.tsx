'use client'

import { useId, useMemo, useState } from 'react'
import { SearchIcon } from '@/components/icons'
import { cx } from '@/components/ui'
import { formatMoney, formatNumber, singular } from '@/lib/format'
import type { SourceOption } from './recipe-detail'

// Normaliza para buscar sin acentos ni mayúsculas
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')

function describe (option: SourceOption): string {
  if (option.kind === 'recipe') return `Subreceta · ${formatMoney(option.perYield)} por ${singular(option.yieldLabel)}`
  return `${formatMoney(option.price)} por ${formatNumber(option.packageQty)} ${option.unit ?? ''}`
}

// Lista con búsqueda para elegir un insumo o una subreceta.
// Reemplaza al <select> nativo: hace scroll dentro de la hoja y se puede filtrar escribiendo.
export function SourcePicker ({ sources, value, onChange }: {
  sources: SourceOption[]
  value: string
  onChange: (key: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(value === '')
  const listId = useId()
  const selected = sources.find(s => s.key === value)

  const groups = useMemo(() => {
    const q = normalize(query.trim())
    const match = (s: SourceOption) => q === '' || normalize(s.name).includes(q)
    return [
      { label: 'Insumos', items: sources.filter(s => s.kind === 'product' && match(s)) },
      { label: 'Subrecetas', items: sources.filter(s => s.kind === 'recipe' && match(s)) }
    ].filter(g => g.items.length > 0)
  }, [sources, query])

  // Ya elegido: se muestra compacto para dejar espacio a cantidad y merma
  if (!open && selected !== undefined) {
    return (
      <div className='flex flex-col gap-1.5'>
        <span className='text-sm font-semibold'>Insumo o subreceta</span>
        <button type='button' onClick={() => { setOpen(true) }}
          className='flex min-h-14 items-center gap-3 rounded-2xl border-[1.5px] border-brand bg-surface px-4 py-2.5 text-left'>
          <span className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate text-[15px] font-semibold'>{selected.name}</span>
            <span className='num truncate text-xs text-muted'>{describe(selected)}</span>
          </span>
          <span className='shrink-0 text-sm font-semibold text-brand'>Cambiar</span>
        </button>
      </div>
    )
  }

  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={`${listId}-search`} className='text-sm font-semibold'>Insumo o subreceta</label>
      <div className='overflow-hidden rounded-2xl border border-line bg-surface focus-within:border-brand'>
        <div className='flex h-12 items-center gap-2.5 border-b border-line px-4'>
          <SearchIcon size={18} className='shrink-0 text-muted' />
          <input id={`${listId}-search`} type='search' value={query} onChange={e => { setQuery(e.target.value) }}
            placeholder={`Buscar entre ${sources.length}`} autoComplete='off' aria-controls={listId}
            className='h-full w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted' />
        </div>
        {/* Altura limitada con scroll propio; overscroll-contain evita arrastrar la hoja al llegar al final */}
        <div id={listId} role='listbox' aria-label='Opciones'
          className='max-h-[min(42dvh,320px)] touch-pan-y overflow-y-auto overscroll-contain'>
          {total === 0 && <p className='px-4 py-6 text-center text-sm text-muted'>Nada coincide con “{query}”.</p>}
          {groups.map(group => (
            <div key={group.label} role='group' aria-label={group.label}>
              <div className='sticky top-0 z-10 bg-surface-2 px-4 py-1.5 text-xs font-semibold text-muted'>{group.label}</div>
              {group.items.map(option => {
                const isSelected = option.key === value
                return (
                  <button key={option.key} type='button' role='option' aria-selected={isSelected}
                    onClick={() => { onChange(option.key); setQuery(''); setOpen(false) }}
                    className={cx('flex w-full items-center gap-3 border-b border-line-soft px-4 py-2.5 text-left transition last:border-b-0 hover:bg-surface-2/70',
                      isSelected && 'bg-brand-soft')}>
                    <span className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-[15px] font-medium'>{option.name}</span>
                      <span className='num truncate text-xs text-muted'>{describe(option)}</span>
                    </span>
                    {isSelected && (
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className='shrink-0 text-brand'>
                        <path d='m5 12 5 5L20 7' />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
