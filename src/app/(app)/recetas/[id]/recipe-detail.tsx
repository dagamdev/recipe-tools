'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { deleteRecipe, updateRecipePricing } from '@/app/actions'
import { AlertIcon, ChevronLeftIcon, PencilIcon, PlusIcon } from '@/components/icons'
import { RecipeForm } from '@/components/recipe-form'
import { Sheet } from '@/components/sheet'
import { buttonDanger, buttonPrimary, cx, EmptyState, FormError, iconButton } from '@/components/ui'
import { costTone, type Unit } from '@/lib/costing'
import { formatMoney, formatNumber, formatPercent, pluralize, singular } from '@/lib/format'
import { ItemForm } from './item-form'

export interface ItemView {
  id: string
  source: string
  name: string
  detail: string
  cost: number
  share: number
  issue: 'units' | 'cycle' | 'missing' | null
  rising: boolean
  quantity: number
  unit: Unit | null
  wastePct: number
}

export interface SourceOption {
  key: string
  kind: 'product' | 'recipe'
  name: string
  unit: Unit | null
  packageQty: number
  price: number
  wastePct: number
  perYield: number
  yieldLabel: string
}

interface RecipeView {
  id: string
  name: string
  category: string | null
  yieldQty: number
  yieldLabel: string
  salePrice: number | null
  isSubrecipe: boolean
}

const TARGET_RATIO = 0.30
const ISSUE_TEXT = {
  units: 'Unidad incompatible con el insumo',
  cycle: 'Subreceta circular',
  missing: 'Ya no existe'
}

export function RecipeDetail ({ recipe, total, items, sources, categories }: {
  recipe: RecipeView
  total: number
  items: ItemView[]
  sources: SourceOption[]
  categories: string[]
}) {
  const [sheet, setSheet] = useState<{ type: 'add' } | { type: 'edit', item: ItemView } | { type: 'options' } | null>(null)
  const close = useCallback(() => { setSheet(null) }, [])
  // Al guardar los datos generales se reinicia el panel de precios con los valores nuevos
  const [panelVersion, setPanelVersion] = useState(0)
  const closeOptions = useCallback(() => { setSheet(null); setPanelVersion(v => v + 1) }, [])

  return (
    <>
      <header className='flex items-center justify-between px-3 pt-5 pb-2'>
        <Link href='/' aria-label='Volver a recetas' className={iconButton}><ChevronLeftIcon /></Link>
        <span className='text-sm font-medium text-muted'>{recipe.isSubrecipe ? 'Subreceta' : recipe.category ?? 'Receta'}</span>
        <button type='button' aria-label='Editar receta' onClick={() => { setSheet({ type: 'options' }) }} className={iconButton}>
          <PencilIcon size={20} />
        </button>
      </header>

      <main className='flex flex-col gap-4 px-5 pb-8'>
        <h1 className='font-display text-[30px] leading-[1.1] font-bold tracking-tight'>{recipe.name}</h1>

        <PricingPanel key={panelVersion} recipe={recipe} total={total} />

        <section aria-labelledby='ingredients-title' className='flex flex-col gap-2.5'>
          <div className='flex items-baseline justify-between'>
            <h2 id='ingredients-title' className='font-display text-xl font-bold'>Ingredientes</h2>
            <span className='text-[13px] text-muted'>{pluralize(items.length, 'elemento', 'elementos')}</span>
          </div>

          {items.length === 0
            ? (
              <EmptyState title='Sin ingredientes todavía'>
                <p>{sources.length === 0 ? 'Primero registra tus insumos en la pestaña Insumos.' : 'Agrega el primero con el botón de abajo.'}</p>
              </EmptyState>
              )
            : (
              <ul className='overflow-hidden rounded-[20px] border border-line bg-surface'>
                {items.map(item => (
                  <li key={item.id} className='border-b border-line-soft last:border-b-0'>
                    <button type='button' onClick={() => { setSheet({ type: 'edit', item }) }}
                      className='flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-surface-2/60'>
                      <span className='flex w-full justify-between gap-3'>
                        <span className='flex min-w-0 flex-col gap-0.5'>
                          <span className='text-[15px] font-semibold'>{item.name}</span>
                          {item.issue !== null
                            ? <span className='flex items-center gap-1 text-xs font-medium text-bad'><AlertIcon size={14} />{ISSUE_TEXT[item.issue]}</span>
                            : <span className='num text-xs text-muted'>{item.detail}</span>}
                        </span>
                        <span className='flex shrink-0 flex-col items-end gap-0.5'>
                          <span className='num text-[15px] font-bold'>{formatMoney(item.cost)}</span>
                          <span className='num text-xs text-muted'>{formatPercent(item.share)}</span>
                        </span>
                      </span>
                      <span aria-hidden='true' className='h-1 w-full rounded-full bg-surface-2'>
                        <span className={cx('block h-1 rounded-full', item.rising ? 'bg-warn' : 'bg-brand')}
                          style={{ width: `${Math.max(item.share * 100, item.cost > 0 ? 2 : 0)}%` }} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              )}
        </section>
      </main>

      <div className='fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/95 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] backdrop-blur'>
        <div className='mx-auto max-w-xl px-5'>
            <button type='button' onClick={() => { setSheet({ type: 'add' }) }} disabled={sources.length === 0} className={buttonPrimary}>
            <PlusIcon size={20} /> Agregar ingrediente
          </button>
        </div>
      </div>

      <Sheet open={sheet?.type === 'add'} onClose={close} title='Agregar ingrediente'>
        <ItemForm mode='add' recipeId={recipe.id} sources={sources} onDone={close} />
      </Sheet>
      <Sheet open={sheet?.type === 'edit'} onClose={close} title='Editar ingrediente'>
        {sheet?.type === 'edit' && <ItemForm mode='edit' recipeId={recipe.id} sources={sources} item={sheet.item} onDone={close} />}
      </Sheet>
      <Sheet open={sheet?.type === 'options'} onClose={close} title='Datos de la receta'>
        <RecipeForm recipeId={recipe.id} defaults={recipe} categories={categories} onDone={closeOptions} />
        <DeleteRecipe recipeId={recipe.id} />
      </Sheet>
    </>
  )
}

function PricingPanel ({ recipe, total }: { recipe: RecipeView, total: number }) {
  const [yieldQty, setYieldQty] = useState(recipe.yieldQty)
  const [priceText, setPriceText] = useState(recipe.salePrice === null ? '' : String(recipe.salePrice))
  const [, startTransition] = useTransition()
  const first = useRef(true)

  const price = priceText.trim() === '' ? null : Number(priceText.replace(',', '.'))
  const validPrice = price !== null && Number.isFinite(price) && price >= 0 ? price : null

  // Guardar con un pequeño retraso mientras el usuario escribe
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const timer = setTimeout(() => {
      startTransition(async () => { await updateRecipePricing(recipe.id, { yieldQty, salePrice: validPrice }) })
    }, 600)
    return () => { clearTimeout(timer) }
  }, [yieldQty, validPrice, recipe.id])

  const per = yieldQty > 0 ? total / yieldQty : total
  const unitName = singular(recipe.yieldLabel)
  const ratio = validPrice !== null && validPrice > 0 ? per / validPrice : null
  const tone = ratio === null ? null : costTone(ratio)
  const toneText = tone === 'good' ? 'text-brand' : tone === 'warn' ? 'text-warn' : 'text-bad'
  const toneBar = tone === 'good' ? 'bg-brand' : tone === 'warn' ? 'bg-warn' : 'bg-bad'
  const step = (delta: number) => { setYieldQty(q => Math.max(1, Math.round(q) + delta)) }

  return (
    <section aria-label='Resumen de costos' className='flex flex-col gap-3.5 rounded-[22px] border border-line bg-surface p-4'>
      <div className='flex items-end justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-xs font-medium text-muted'>Costo por {unitName}</span>
          <span className='num font-display text-4xl leading-none font-bold text-brand'>{formatMoney(per)}</span>
        </div>
        <div className='flex flex-col items-end gap-0.5'>
          <span className='text-xs font-medium text-muted'>Costo total</span>
          <span className='num text-[17px] font-bold'>{formatMoney(total)}</span>
        </div>
      </div>

      <div className={cx('grid gap-2.5', recipe.isSubrecipe ? 'grid-cols-1' : 'grid-cols-2')}>
        <div className='flex flex-col gap-1.5'>
          <span id='yield-label' className='text-xs font-medium text-muted'>Rinde ({recipe.yieldLabel})</span>
          <div role='group' aria-labelledby='yield-label' className='flex h-12 items-center justify-between rounded-[14px] border border-line px-1'>
            <button type='button' aria-label={`Quitar una ${unitName}`} onClick={() => { step(-1) }} className='size-10 rounded-[10px] bg-surface-2 text-xl'>−</button>
            <span className='num text-[17px] font-bold' aria-live='polite'>{formatNumber(yieldQty)}</span>
            <button type='button' aria-label={`Agregar una ${unitName}`} onClick={() => { step(1) }} className='size-10 rounded-[10px] bg-surface-2 text-xl'>+</button>
          </div>
        </div>
        {!recipe.isSubrecipe && (
          <label className='flex flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted'>Precio de venta</span>
            <span className='flex h-12 items-center gap-1 rounded-[14px] border-[1.5px] border-brand px-3'>
              <span aria-hidden='true' className='text-[17px] font-semibold text-muted'>$</span>
              <input type='number' inputMode='decimal' step='any' min='0' value={priceText} placeholder='0'
                onChange={e => { setPriceText(e.target.value) }}
                className='num w-full min-w-0 bg-transparent text-[17px] font-bold outline-none' />
            </span>
          </label>
        )}
      </div>

      {!recipe.isSubrecipe && ratio !== null && validPrice !== null && (
        <div className='flex flex-col gap-2'>
          <div aria-hidden='true' className='h-2.5 overflow-hidden rounded-full bg-brand-soft'>
            <div className={cx('h-full rounded-full transition-[width]', toneBar)} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
          </div>
          <div className='flex flex-wrap justify-between gap-x-3 gap-y-1 text-[13px]'>
            <span><strong className={cx('num', toneText)}>{formatPercent(ratio)}</strong> <span className='text-muted'>es costo</span></span>
            <span>
              <span className='text-muted'>{validPrice >= per ? 'Ganas' : 'Pierdes'}</span>{' '}
              <strong className='num'>{formatMoney(Math.abs(validPrice - per))}</strong>{' '}
              <span className='text-muted'>por {unitName}</span>
            </span>
          </div>
          {ratio > TARGET_RATIO && (
            <p className='rounded-[10px] bg-warn-soft px-2.5 py-2 text-xs leading-snug text-warn-soft-ink'>
              Para quedar en {formatPercent(TARGET_RATIO)} de costo, vende a <strong className='num'>{formatMoney(per / TARGET_RATIO)}</strong>.
            </p>
          )}
        </div>
      )}
      {!recipe.isSubrecipe && validPrice === null && (
        <p className='text-xs text-muted'>Escribe el precio de venta para ver tu margen.</p>
      )}
    </section>
  )
}

function DeleteRecipe ({ recipeId }: { recipeId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  return (
    <div className='flex flex-col gap-2 border-t border-line pt-4'>
      <FormError message={error} />
      <button type='button' disabled={pending} className={buttonDanger}
        onClick={() => {
          if (!confirming) { setConfirming(true); return }
          startTransition(async () => {
            const result = await deleteRecipe(recipeId)
            if (result?.error !== undefined) setError(result.error)
          })
        }}>
        {pending ? 'Eliminando…' : confirming ? 'Toca otra vez para eliminarla' : 'Eliminar receta'}
      </button>
    </div>
  )
}

