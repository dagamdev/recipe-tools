import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe, Ingredient } from '../types'

interface RecipesStore {
  recipes: Recipe[]
  addRecipe: (newRecipe: Omit<Recipe, 'id'>) => void
  editRecipe: (recipeId: string, recipe: Omit<Recipe, 'id' | 'ingredients'>) => void
  removeRecipe: (recipeId: string) => void
  addIngredient: (recipeId: string, newIngredient: Ingredient) => void
  editIngredient: (recipeId: string, productId: string, ingredient: Ingredient) => void
  removeIngredient: (recipeId: string, productId: string) => void
}

export const useRecipesStore = create<RecipesStore>()(persist(set => ({
  recipes: [],
  addRecipe (newRecipe) {
    set(({ recipes }) => ({
      recipes: [...recipes, { id: crypto.randomUUID(), ...newRecipe }]
    }))
  },
  editRecipe (recipeId, recipe) {
    set(({ recipes }) => ({
      recipes: recipes.map(r => r.id === recipeId ? { ...r, ...recipe } : r)
    }))
  },
  removeRecipe (recipeId) {
    set(({ recipes }) => ({
      recipes: recipes.filter(r => r.id !== recipeId)
    }))
  },
  addIngredient (recipeId, newIngredient) {
    set(({ recipes }) => ({
      recipes: recipes.map(r => r.id === recipeId ? { ...r, ingredients: [...r.ingredients, newIngredient] } : r)
    }))
  },
  editIngredient (recipeId, productId, ingredient) {
    set(({ recipes }) => ({
      recipes: recipes.map(r => r.id === recipeId ? { ...r, ingredients: r.ingredients.map(i => i.productId === productId ? ingredient : i) } : r)
    }))
  },
  removeIngredient (recipeId, productId) {
    set(({ recipes }) => ({
      recipes: recipes.map(r => r.id === recipeId ? { ...r, ingredients: r.ingredients.filter(i => i.productId !== productId) } : r)
    }))
  }
}), {
  name: 'recipes'
}))
