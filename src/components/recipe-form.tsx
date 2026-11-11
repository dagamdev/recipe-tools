'use client'

import { useActionState, useEffect } from 'react'
import { createRecipe, updateRecipeDetails, type ActionState } from '@/app/actions'
import { buttonPrimary, Field, FormError, inputBase } from './ui'

export interface RecipeFormValues {
  name: string
  category: string | null
  yieldQty: number
  yieldLabel: string
  salePrice: number | null
  isSubrecipe: boolean
}

const YIELD_LABELS = ['porciones', 'piezas', 'tandas', 'kg', 'litros']

// Crear receta (recipeId null) o editar sus datos generales
export function RecipeForm ({ recipeId, defaults, categories, onDone }: {
  recipeId: string | null
  defaults?: RecipeFormValues
  categories: string[]
  onDone?: () => void
}) {
  const action = recipeId === null ? createRecipe : updateRecipeDetails.bind(null, recipeId)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {})

  useEffect(() => {
    if (state.ok === true) onDone?.()
  }, [state, onDone])

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      <Field label='Nombre' htmlFor='recipe-name'>
        <input id='recipe-name' name='name' required maxLength={80} defaultValue={defaults?.name}
          placeholder='Pastel de chocolate' className={inputBase} autoFocus={recipeId === null} />
      </Field>

      <Field label='Categoría' htmlFor='recipe-category' hint='Opcional'>
        <input id='recipe-category' name='category' list='recipe-categories' maxLength={40}
          defaultValue={defaults?.category ?? ''} placeholder='Postres' className={inputBase} />
        <datalist id='recipe-categories'>
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
      </Field>

      <div className='grid grid-cols-2 gap-3'>
        <Field label='Rinde' htmlFor='recipe-yield'>
          <input id='recipe-yield' name='yieldQty' type='number' inputMode='decimal' step='any' min='0' required
            defaultValue={defaults?.yieldQty ?? 1} className={`${inputBase} num`} />
        </Field>
        <Field label='Medido en' htmlFor='recipe-yield-label'>
          <input id='recipe-yield-label' name='yieldLabel' list='yield-labels' required maxLength={20}
            defaultValue={defaults?.yieldLabel ?? 'porciones'} className={inputBase} />
          <datalist id='yield-labels'>
            {YIELD_LABELS.map(l => <option key={l} value={l} />)}
          </datalist>
        </Field>
      </div>

      <Field label='Precio de venta' htmlFor='recipe-price' hint='Por cada unidad de rendimiento'>
        <div className='relative'>
          <span aria-hidden='true' className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-muted'>$</span>
          <input id='recipe-price' name='salePrice' type='number' inputMode='decimal' step='any' min='0'
            defaultValue={defaults?.salePrice ?? ''} className={`${inputBase} num pl-8`} />
        </div>
      </Field>

      <label className='flex min-h-13 items-center gap-3 rounded-2xl border border-line px-4 py-3'>
        <input type='checkbox' name='isSubrecipe' defaultChecked={defaults?.isSubrecipe ?? false} className='size-5 accent-[var(--brand)]' />
        <span className='flex flex-col'>
          <span className='text-sm font-semibold'>Es una subreceta</span>
          <span className='text-xs text-muted'>Una salsa, masa o relleno que usas dentro de otras recetas</span>
        </span>
      </label>

      <FormError message={state.error} />
      <button type='submit' disabled={pending} className={buttonPrimary}>
        {pending ? 'Guardando…' : recipeId === null ? 'Crear receta' : 'Guardar cambios'}
      </button>
    </form>
  )
}
