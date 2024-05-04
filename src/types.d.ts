export interface Recipe {
  id: string
  name: string
  ingredients: Array<{
    id: string
    name: string
    price: number
    quantity: number
    unitOfMeasurement: 'g' | 'k' | 'ml' | 'l'
  }>
}
