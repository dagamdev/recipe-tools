'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { addRecipeItem, deleteRecipeItem, updateRecipeItem, type ActionState } from '@/app/actions'
import { applyWaste, compatibleUnits, productItemCost, type Unit } from '@/lib/costing'
import { formatMoney, formatNumber } from '@/lib/format'
import { buttonDanger, buttonPrimary, cx, Field, FormError, inputBase } from '@/components/ui'
import type { ItemView, SourceOption } from './recipe-detail'

// Formulario para agregar o editar un ingrediente, con el costo calculado al momento
export function ItemForm ({ mode, recipeId, sources, item, onDone }: {
  mode: 'add' | 'edit'
  recipeId: string
  sources: SourceOption[]
  item?: ItemView
  onDone: () => void
}) {
  const action = mode === 'add' ? addRecipeItem.bind(null, recipeId) : updateRecipeItem.bind(null, item?.id ?? '')
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {})

  const [sourceKey, setSourceKey] = useState(item?.source ?? '')
  const source = sources.find(s => s.key === sourceKey)
  const [quantity, setQuantity] = useState(item === undefined ? '' : String(item.quantity))
  const [unit, setUnit] = useState<Unit | null>(item?.unit ?? source?.unit ?? null)
  const [waste, setWaste] = useState(item === undefined ? '' : item.wastePct === 0 ? '' : String(item.wastePct))

  useEffect(() => {
    if (state.ok === true) onDone()
  }, [state, onDone])

  const pickSource = (key: string) => {
    setSourceKey(key)
    const next = sources.find(s => s.key === key)
    setUnit(next?.unit ?? null)
    setWaste(next !== undefined && next.wastePct > 0 ? String(next.wastePct) : '')
  }

  const qty = Number(quantity.replace(',', '.'))
  const wastePct = waste.trim() === '' ? 0 : Number(waste.replace(',', '.'))
  const units = source?.unit != null ? compatibleUnits(source.unit) : []

  // Vista previa del costo
  let preview: number | null = null
  let explain = ''
  if (source !== undefined && Number.isFinite(qty) && qty > 0 && Number.isFinite(wastePct)) {
    if (source.kind === 'product' && source.unit !== null && unit !== null) {
      preview = productItemCost({ packageQty: source.packageQty, unit: source.unit, price: source.price }, qty, unit, wastePct)
      explain = wastePct > 0
        ? `Compras ${formatNumber(qty / (1 - Math.min(95, wastePct) / 100))} ${unit} para usar ${formatNumber(qty)} ${unit}`
        : `${formatMoney(source.price)} por ${formatNumber(source.packageQty)} ${source.unit}`
    } else if (source.kind === 'recipe') {
      preview = applyWaste(source.perYield * qty, wastePct)
      explain = `${formatMoney(source.perYield)} por cada ${source.yieldLabel.replace(/s$/, '')}`
    }
  }

  const productOptions = sources.filter(s => s.kind === 'product')
  const recipeOptions = sources.filter(s => s.kind === 'recipe')

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      {mode === 'add'
        ? (
          <Field label='Insumo o subreceta' htmlFor='item-source'>
            <select id='item-source' name='source' required value={sourceKey} onChange={e => { pickSource(e.target.value) }}
              className={cx(inputBase, 'appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-10')}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%235B655F%27 stroke-width=%272%27 stroke-linecap=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")' }}>
              <option value='' disabled>Elige uno…</option>
              {productOptions.length > 0 && (
                <optgroup label='Insumos'>
                  {productOptions.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                </optgroup>
              )}
              {recipeOptions.length > 0 && (
                <optgroup label='Subrecetas'>
                  {recipeOptions.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
                </optgroup>
              )}
            </select>
          </Field>
          )
        : (
          <div className='flex flex-col gap-0.5 rounded-2xl bg-surface-2 px-4 py-3'>
            <span className='text-[15px] font-semibold'>{item?.name}</span>
            {source !== undefined && source.kind === 'product' && (
              <span className='num text-xs text-muted'>{formatMoney(source.price)} por {formatNumber(source.packageQty)} {source.unit}</span>
            )}
          </div>
          )}

      <Field label='Cantidad' htmlFor='item-qty' hint={source?.kind === 'recipe' ? `En ${source.yieldLabel}` : undefined}>
        <div className='flex gap-2.5'>
          <input id='item-qty' name='quantity' type='number' inputMode='decimal' step='any' min='0' required
            value={quantity} onChange={e => { setQuantity(e.target.value) }} placeholder='0'
            className={cx(inputBase, 'num flex-1 border-[1.5px] text-lg font-bold')} />
          {units.length > 1 && (
            <div role='radiogroup' aria-label='Unidad' className='grid shrink-0 auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-surface-2 p-1'>
              {units.map(u => (
                <button key={u} type='button' role='radio' aria-checked={unit === u} onClick={() => { setUnit(u) }}
                  className={cx('min-w-12 rounded-xl px-3 text-[15px] font-semibold transition', unit === u ? 'bg-surface text-ink shadow-sm' : 'text-muted')}>
                  {u}
                </button>
              ))}
            </div>
          )}
          {units.length === 1 && <span className='flex items-center px-2 text-[15px] font-semibold text-muted'>{units[0]}</span>}
        </div>
        <input type='hidden' name='unit' value={unit ?? ''} />
      </Field>

      <Field label='Merma' htmlFor='item-waste' hint='Lo que se pierde al limpiar o cocinar'>
        <div className='relative'>
          <input id='item-waste' name='wastePct' type='number' inputMode='decimal' step='any' min='0' max='95'
            value={waste} onChange={e => { setWaste(e.target.value) }} placeholder='0'
            className={cx(inputBase, 'num pr-10')} />
          <span aria-hidden='true' className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-muted'>%</span>
        </div>
      </Field>

      <div className='flex items-center justify-between gap-3 rounded-[18px] bg-brand-soft px-4 py-3.5'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='text-xs font-medium text-brand-soft-ink'>Costo de este ingrediente</span>
          <span className='num text-xs leading-snug text-brand-soft-ink/80'>{explain === '' ? 'Completa los datos' : explain}</span>
        </div>
        <span className='num font-display text-[28px] font-bold text-brand-soft-ink' aria-live='polite'>
          {preview === null ? '—' : formatMoney(preview)}
        </span>
      </div>

      <FormError message={state.error} />
      <button type='submit' disabled={pending || source === undefined} className={buttonPrimary}>
        {pending ? 'Guardando…' : mode === 'add' ? 'Agregar a la receta' : 'Guardar cambios'}
      </button>
      {mode === 'edit' && item !== undefined && <RemoveItem itemId={item.id} onDone={onDone} />}
    </form>
  )
}

function RemoveItem ({ itemId, onDone }: { itemId: string, onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  return (
    <>
      <FormError message={error} />
      <button type='button' disabled={pending} className={buttonDanger}
        onClick={() => {
          startTransition(async () => {
            const result = await deleteRecipeItem(itemId)
            if (result.error !== undefined) setError(result.error)
            else onDone()
          })
        }}>
        {pending ? 'Quitando…' : 'Quitar de la receta'}
      </button>
    </>
  )
}
