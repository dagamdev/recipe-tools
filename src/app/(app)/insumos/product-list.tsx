'use client'

import { useActionState, useCallback, useEffect, useState, useTransition } from 'react'
import { deleteProduct, saveProduct, type ActionState } from '@/app/actions'
import { PlusIcon } from '@/components/icons'
import { Sheet } from '@/components/sheet'
import { Badge, buttonDanger, buttonPrimary, cx, EmptyState, Field, FormError, inputBase } from '@/components/ui'
import type { Unit } from '@/lib/costing'
import { formatMoney, formatNumber, formatPercent, formatUnitPrice, pluralize } from '@/lib/format'

export interface ProductView {
  id: string
  name: string
  packageQty: number
  unit: Unit
  price: number
  wastePct: number
  unitPrice: number
  baseUnit: Unit
  uses: number
  change: number | null
  history: Array<{ id: string, price: number, packageQty: number, unit: Unit, at: string }>
}

const UNIT_OPTIONS: Array<{ value: Unit, label: string }> = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pz', label: 'pz' }
]

const dateFormat = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export function ProductList ({ products, hasAny }: { products: ProductView[], hasAny: boolean }) {
  const [sheet, setSheet] = useState<{ type: 'new' } | { type: 'edit', product: ProductView } | null>(null)
  const close = useCallback(() => { setSheet(null) }, [])

  return (
    <>
      {!hasAny
        ? (
          <EmptyState title='Registra tu primer insumo'>
            <p>Anota cómo lo compras y cuánto pagas, por ejemplo: harina, 1 kg, $32.</p>
          </EmptyState>
          )
        : products.length === 0
          ? <EmptyState title='Sin resultados'><p>Prueba con otro nombre.</p></EmptyState>
          : (
            <ul className='overflow-hidden rounded-[20px] border border-line bg-surface'>
              {products.map(p => (
                <li key={p.id} className='border-b border-line-soft last:border-b-0'>
                  <button type='button' onClick={() => { setSheet({ type: 'edit', product: p }) }}
                    className='flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2/60'>
                    <span aria-hidden='true' className='flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-surface-2 text-[15px] font-bold text-muted'>
                      {p.name.charAt(0).toLocaleUpperCase('es')}
                    </span>
                    <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='truncate text-[15px] font-semibold'>{p.name}</span>
                      <span className='num truncate text-xs text-muted'>
                        {formatNumber(p.packageQty)} {p.unit}
                        {p.wastePct > 0 && ` · merma ${formatNumber(p.wastePct)}%`}
                        {' · '}{p.uses === 0 ? 'sin usar' : `en ${pluralize(p.uses, 'receta', 'recetas')}`}
                      </span>
                    </span>
                    <span className='flex shrink-0 flex-col items-end gap-1'>
                      <span className='num text-[15px] font-bold'>{formatMoney(p.price)}</span>
                      {p.change !== null && (
                        <Badge tone={p.change > 0 ? 'bad' : 'good'}>{p.change > 0 ? '▲' : '▼'} {formatPercent(Math.abs(p.change))}</Badge>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            )}

      {hasAny && (
        <p className='px-1 text-xs leading-snug text-muted'>
          Al cambiar un precio se recalculan todas las recetas que lo usan y queda en el historial.
        </p>
      )}

      <button type='button' onClick={() => { setSheet({ type: 'new' }) }} aria-label='Nuevo insumo'
        className='fixed right-[max(1.25rem,calc(50vw-17rem))] bottom-28 z-30 flex size-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-[0_8px_20px_rgb(30_91_67/0.35)] transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'>
        <PlusIcon size={24} />
      </button>

      <Sheet open={sheet?.type === 'new'} onClose={close} title='Nuevo insumo'>
        <ProductForm product={null} onDone={close} />
      </Sheet>
      <Sheet open={sheet?.type === 'edit'} onClose={close} title='Editar insumo'>
        {sheet?.type === 'edit' && (
          <>
            <ProductForm product={sheet.product} onDone={close} />
            <PriceHistory product={sheet.product} />
            <DeleteProduct product={sheet.product} onDone={close} />
          </>
        )}
      </Sheet>
    </>
  )
}

function ProductForm ({ product, onDone }: { product: ProductView | null, onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProduct.bind(null, product?.id ?? null), {})
  const [unit, setUnit] = useState<Unit>(product?.unit ?? 'kg')

  useEffect(() => {
    if (state.ok === true) onDone()
  }, [state, onDone])

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <Field label='Nombre' htmlFor='product-name'>
        <input id='product-name' name='name' required maxLength={80} defaultValue={product?.name}
          placeholder='Harina de trigo' autoFocus={product === null} className={inputBase} />
      </Field>

      <Field label='Presentación' htmlFor='product-qty' hint='Cómo lo compras'>
        <div className='flex flex-col gap-2'>
          <input id='product-qty' name='packageQty' type='number' inputMode='decimal' step='any' min='0' required
            defaultValue={product?.packageQty ?? 1} className={cx(inputBase, 'num')} />
          <div role='radiogroup' aria-label='Unidad' className='grid grid-cols-5 gap-1 rounded-2xl bg-surface-2 p-1'>
            {UNIT_OPTIONS.map(o => (
              <button key={o.value} type='button' role='radio' aria-checked={unit === o.value} onClick={() => { setUnit(o.value) }}
                className={cx('h-10 rounded-xl text-[15px] font-semibold transition', unit === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted')}>
                {o.label}
              </button>
            ))}
          </div>
          <input type='hidden' name='unit' value={unit} />
        </div>
      </Field>

      <div className='grid grid-cols-2 gap-3'>
        <Field label='Precio' htmlFor='product-price'>
          <div className='relative'>
            <span aria-hidden='true' className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-muted'>$</span>
            <input id='product-price' name='price' type='number' inputMode='decimal' step='any' min='0' required
              defaultValue={product?.price} className={cx(inputBase, 'num pl-8')} />
          </div>
        </Field>
        <Field label='Merma' htmlFor='product-waste' hint='Sugerida'>
          <div className='relative'>
            <input id='product-waste' name='wastePct' type='number' inputMode='decimal' step='any' min='0' max='95'
              defaultValue={product === null || product.wastePct === 0 ? '' : product.wastePct} placeholder='0'
              className={cx(inputBase, 'num pr-10')} />
            <span aria-hidden='true' className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-muted'>%</span>
          </div>
        </Field>
      </div>

      <FormError message={state.error} />
      <button type='submit' disabled={pending} className={buttonPrimary}>
        {pending ? 'Guardando…' : product === null ? 'Guardar insumo' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function PriceHistory ({ product }: { product: ProductView }) {
  if (product.history.length === 0) return null
  return (
    <section aria-labelledby='history-title' className='flex flex-col gap-2 border-t border-line pt-4'>
      <div className='flex items-baseline justify-between'>
        <h3 id='history-title' className='text-sm font-semibold'>Historial de precio</h3>
        <span className='num text-xs text-muted'>{formatUnitPrice(product.unitPrice)} por {product.baseUnit}</span>
      </div>
      <ul className='flex flex-col'>
        {product.history.map(h => (
          <li key={h.id} className='num flex justify-between border-b border-line-soft py-2 text-sm last:border-b-0'>
            <span className='text-muted'>{dateFormat.format(new Date(h.at))}</span>
            <span><strong>{formatMoney(h.price)}</strong> <span className='text-muted'>/ {formatNumber(h.packageQty)} {h.unit}</span></span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DeleteProduct ({ product, onDone }: { product: ProductView, onDone: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  return (
    <div className='flex flex-col gap-2'>
      <FormError message={error} />
      <button type='button' disabled={pending} className={buttonDanger}
        onClick={() => {
          if (!confirming) { setConfirming(true); return }
          startTransition(async () => {
            const result = await deleteProduct(product.id)
            if (result.error !== undefined) { setError(result.error); setConfirming(false) } else onDone()
          })
        }}>
        {pending ? 'Eliminando…' : confirming ? 'Toca otra vez para eliminarlo' : 'Eliminar insumo'}
      </button>
    </div>
  )
}
