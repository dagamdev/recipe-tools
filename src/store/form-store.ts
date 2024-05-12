import { create } from 'zustand'
import type { Product, RecipeProduct } from '@/types'

export type Types = 'recipe' | 'product' | 'ingredient'
type Actions = 'create' | 'update'

interface FormStore {
  open: boolean
  type: Types
  action: Actions
  defaultValues?: RecipeProduct
  setTools: (tools: {
    type?: Types
    action?: Actions
    manageValues?: (values: RecipeProduct) => void
    defaultValues?: RecipeProduct
    ingredients?: Product[]
  }) => void
  setOpen: (open: boolean) => void
  manageValues: (values: RecipeProduct) => void
  ingredients?: Product[]
}

export const useToolsStore = create<FormStore>()(set => ({
  open: false,
  type: 'recipe',
  action: 'create',
  setOpen (open) {
    set({ open })
    if (!open) {
      set({ ingredients: undefined })
    }
  },
  manageValues (values) {
    console.log(values)
  },
  setTools (tools) {
    set({ ...tools, open: true })
  }
}))
