import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface ProductsStore {
  products: Product[]
  addProduct: (newProduct: Omit<Product, 'id'>) => void
  editProduct: (productId: string, product: Omit<Product, 'id'>) => void
  removeProduct: (productId: string) => void
}

export const useProductsStore = create<ProductsStore>()(persist(set => ({
  products: [],
  addProduct (newProduct) {
    set(({ products }) => ({
      products: [...products, { id: crypto.randomUUID(), ...newProduct }]
    }))
  },
  editProduct (productId, product) {
    set(({ products }) => ({
      products: products.map(p => p.id === productId ? { ...p, ...product } : p)
    }))
  },
  removeProduct (productId) {
    set(({ products }) => ({
      products: products.filter(p => p.id !== productId)
    }))
  }
}), {
  name: 'products'
}))
