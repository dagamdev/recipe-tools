import { create } from 'zustand'
import type { Recipe } from '../types'

const defaultRecipes: Recipe[] = [
  {
    id: '123k',
    name: 'pizza',
    ingredients: [
      {
        id: '2l3k',
        name: 'harina de trigo',
        price: 18,
        quantity: 1,
        unitOfMeasurement: 'k'
      },
      {
        id: '324-l5',
        name: 'sal',
        price: 10,
        quantity: 500,
        unitOfMeasurement: 'g'
      }
    ]
  }
]

interface RecipesStore {
  recipes: Recipe[]
  addRecipe: () => void
}

export const useRecipesStore = create<RecipesStore>()(set => ({
  recipes: defaultRecipes,
  addRecipe () {

  }
}))
