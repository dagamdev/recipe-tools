'use client'

import { useState } from 'react'
import { PlusIcon } from '@/components/icons'
import { RecipeForm } from '@/components/recipe-form'
import { Sheet } from '@/components/sheet'

export function NewRecipeButton ({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type='button' onClick={() => { setOpen(true) }} aria-label='Nueva receta'
        className='fixed right-[max(1.25rem,calc(50vw-17rem))] bottom-28 z-30 flex size-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-[0_8px_20px_rgb(30_91_67/0.35)] transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'>
        <PlusIcon size={24} />
      </button>
      <Sheet open={open} onClose={() => { setOpen(false) }} title='Nueva receta'>
        <RecipeForm recipeId={null} categories={categories} />
      </Sheet>
    </>
  )
}
