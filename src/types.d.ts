export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
}

export interface Ingredient {
  unit: 'g' | 'k' | 'ml' | 'l'
  productId: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  unit: 'g' | 'k' | 'ml' | 'l'
  price: number
  quantity: number
}
