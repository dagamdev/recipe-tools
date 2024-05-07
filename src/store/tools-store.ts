import { create } from 'zustand'
import type { RecipeProduct } from '@/types'

export type Types = 'recipe' | 'product' | 'ingredient'
type Actions = 'create' | 'update'

interface ToolsStore {
  open: boolean
  type: Types
  action: Actions
  formData?: RecipeProduct
  setTools: (tools: {
    type?: Types
    action?: Actions
    manageValues?: (values: RecipeProduct) => void
    formData?: RecipeProduct
  }) => void
  setOpen: (open: boolean) => void
  manageValues: (values: RecipeProduct) => void
}

export const useToolsStore = create<ToolsStore>()(set => ({
  open: false,
  type: 'recipe',
  action: 'create',
  setOpen (open) {
    set({ open })
  },
  manageValues (values) {
    console.log(values)
  },
  setTools (tools) {
    set({ ...tools, open: true })
  }
}))
