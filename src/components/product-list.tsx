'use client'

import { useProductsStore } from '@/store/products-store'
import CreationButton from './creation-button'
import { useFormStore } from '@/store/form-store'
import ProductCard from './product'

export default function ProductList () {
  const { products, addProduct, editProduct, removeProduct } = useProductsStore()
  const setTools = useFormStore(store => store.setTools)

  return (
    <section className='space-y-4'>
      <div className='flex justify-between'>
        <h3 className='text-2xl font-bold'>Products:</h3>
        <CreationButton onClick={() => {
          setTools({
            type: 'product',
            action: 'create',
            manageValues (values) {
              if ('unit' in values && 'name' in values) {
                addProduct({ ...values })
              }
            },
            defaultValues: undefined
          })
        }} elementType='product' />
      </div>

      <ul className='flex flex-col gap-y-2'>
        {products.length > 0 && products.map(p => <ProductCard key={p.id} product={p}
          editProduct={product => {
            setTools({
              type: 'product',
              action: 'update',
              manageValues (values) {
                if ('unit' in values && 'name' in values) {
                  editProduct(product.id, values)
                }
              },
              defaultValues: product
            })
          }}
          removeProduct={id => { removeProduct(id) }}
        />)}
      </ul>
    </section>
  )
}
