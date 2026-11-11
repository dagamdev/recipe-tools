import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronRightIcon, TrendUpIcon } from '@/components/icons'
import { SearchBox } from '@/components/search-box'
import { Badge, cx, EmptyState, type Tone } from '@/components/ui'
import { requireUserId } from '@/lib/auth'
import { costTone } from '@/lib/costing'
import { loadWorkspace, topPriceIncrease } from '@/lib/data'
import { formatMoney, formatNumber, formatPercent, pluralize } from '@/lib/format'
import { NewRecipeButton } from './new-recipe-button'

export const metadata: Metadata = { title: 'Recetas' }

const SUBRECIPES = '__sub'
const RECENT_DAYS = 30

export default async function RecipesPage ({ searchParams }: {
  searchParams: Promise<{ q?: string, cat?: string }>
}) {
  const userId = await requireUserId()
  const { q = '', cat } = await searchParams
  const ws = await loadWorkspace(userId)

  // Promedio del % de costo en recetas con precio de venta
  const ratios = ws.recipes.flatMap(r => {
    const cost = ws.costs.get(r.id)
    return r.salePrice !== null && r.salePrice > 0 && cost !== undefined ? [cost.perYield / r.salePrice] : []
  })
  const average = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null
  const subCount = ws.recipes.filter(r => r.isSubrecipe).length

  const alert = topPriceIncrease(ws, RECENT_DAYS)

  const query = q.trim().toLocaleLowerCase('es')
  const visible = ws.recipes.filter(r => {
    if (cat === SUBRECIPES && !r.isSubrecipe) return false
    if (cat !== undefined && cat !== SUBRECIPES && r.category !== cat) return false
    return query === '' || r.name.toLocaleLowerCase('es').includes(query)
  })

  const filters = [
    { label: 'Todas', value: undefined },
    ...ws.categories.map(c => ({ label: c, value: c })),
    ...(subCount > 0 ? [{ label: 'Subrecetas', value: SUBRECIPES }] : [])
  ]

  return (
    <main className='flex flex-col gap-4 px-5 pt-7 pb-20'>
      <header className='flex flex-col gap-0.5'>
        <span className='text-sm font-medium text-muted'>Tu recetario</span>
        <h1 className='font-display text-[32px] leading-tight font-bold tracking-tight'>Recetas</h1>
      </header>

      {ws.recipes.length > 0 && (
        <div className='grid grid-cols-2 gap-2.5'>
          <div className='flex flex-col gap-1 rounded-[18px] bg-brand px-4 py-3.5 text-brand-ink'>
            <span className='text-xs font-medium opacity-80'>Costo promedio</span>
            <span className='num font-display text-[28px] leading-none font-bold'>{average === null ? '—' : formatPercent(average)}</span>
            <span className='text-xs opacity-80'>{average === null ? 'Agrega precios de venta' : 'del precio de venta'}</span>
          </div>
          <div className='flex flex-col gap-1 rounded-[18px] border border-line bg-surface px-4 py-3.5'>
            <span className='text-xs font-medium text-muted'>Recetas</span>
            <span className='num font-display text-[28px] leading-none font-bold'>{formatNumber(ws.recipes.length)}</span>
            <span className='text-xs text-muted'>{subCount === 0 ? 'sin subrecetas' : pluralize(subCount, 'subreceta', 'subrecetas')}</span>
          </div>
        </div>
      )}

      {alert !== undefined && (
        <Link href='/insumos' className='flex items-center gap-3 rounded-2xl bg-warn-soft px-3.5 py-3 text-warn-soft-ink'>
          <TrendUpIcon size={20} className='shrink-0' />
          <span className='flex-1 text-[13px] leading-snug'>
            <strong>{alert.product.name} subió {formatPercent(alert.change.ratio)}.</strong>{' '}
            Afecta a {pluralize(alert.uses, 'receta', 'recetas')}.
          </span>
          <ChevronRightIcon size={16} className='shrink-0' />
        </Link>
      )}

      {ws.recipes.length > 0 && (
        <>
          <Suspense>
            <SearchBox label='Buscar recetas' placeholder='Buscar receta' />
          </Suspense>
          {filters.length > 1 && (
            <nav aria-label='Filtrar por categoría' className='-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]'>
              {filters.map(f => {
                const active = cat === f.value
                const href = f.value === undefined ? '/' : `/?cat=${encodeURIComponent(f.value)}`
                return (
                  <Link key={f.label} href={href} aria-current={active ? 'true' : undefined}
                    className={cx('flex h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] whitespace-nowrap',
                      active ? 'bg-ink font-semibold text-bg' : 'border border-line bg-surface font-medium')}>
                    {f.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </>
      )}

      {ws.recipes.length === 0
        ? (
          <EmptyState title='Aún no tienes recetas'>
            <p>Empieza registrando tus <Link href='/insumos' className='font-semibold text-brand underline'>insumos</Link> con lo que pagas por ellos, y luego crea tu primera receta con el botón +.</p>
          </EmptyState>
          )
        : visible.length === 0
          ? <EmptyState title='Sin resultados'><p>Prueba con otro nombre o filtro.</p></EmptyState>
          : (
            <ul className='flex flex-col gap-2.5'>
              {visible.map(r => {
                const cost = ws.costs.get(r.id)
                const per = cost?.perYield ?? 0
                const ratio = r.salePrice !== null && r.salePrice > 0 ? per / r.salePrice : null
                let tone: Tone = 'neutral'
                let badge = 'Sin precio'
                if (r.isSubrecipe) badge = 'Subreceta'
                else if (ratio !== null) {
                  tone = costTone(ratio)
                  badge = `${formatPercent(ratio)} costo`
                }
                const meta = [
                  `${formatNumber(r.yieldQty)} ${r.yieldLabel}`,
                  r.salePrice !== null && !r.isSubrecipe ? `venta ${formatMoney(r.salePrice)}` : null
                ].filter(Boolean).join(' · ')

                return (
                  <li key={r.id}>
                    <Link href={`/recetas/${r.id}`}
                      className='flex items-center gap-3.5 rounded-[18px] border border-line bg-surface px-4 py-3.5 transition active:scale-[0.99]'>
                      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                        <strong className='truncate text-base font-semibold'>{r.name}</strong>
                        <span className='truncate text-[13px] text-muted'>{meta}</span>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <span className='num text-base font-bold'>{formatMoney(per)}</span>
                        {cost?.hasIssues === true ? <Badge tone='bad'>Revisar</Badge> : <Badge tone={tone}>{badge}</Badge>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
            )}

      <NewRecipeButton categories={ws.categories} />
    </main>
  )
}
