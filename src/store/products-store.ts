import { create } from 'zustand'
import type { Product } from '@/types'

interface ProductsStore {
  products: Product[]
}

export const useProductsStore = create<ProductsStore>()(set => ({
  products: [
    {
      id: '2l3k',
      name: 'harina de trigo',
      price: 18,
      quantity: 1,
      unit: 'k'
    },
    {
      id: '324-l5',
      name: 'sal',
      price: 10,
      quantity: 500,
      unit: 'g'
    }
  ]
}))
