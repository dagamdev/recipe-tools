'use client'

import { useProductsStore } from '@/store/products-store'
import ProductsTable from './products-table'

export default function ProductList () {
  const products = useProductsStore(store => store.products)

  return (
    <section>
      <h3 className='text-muted-foreground text-xl font-bold mb-2'>Products:</h3>

      <ProductsTable products={products} caption='A list of reference products for recipe ingredients.' />
    </section>
  )
}
