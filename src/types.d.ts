export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
}

export type Units = 'g' | 'k' | 'ml' | 'l'

export interface Ingredient {
  unit: Units
  productId: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  unit: Units
  price: number
  quantity: number
}

export type RecipeProduct = Omit<Product, 'id'> | Omit<Recipe, 'id' | 'ingredients'> | Ingredient
