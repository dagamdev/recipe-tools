'use client'

import CreationButton from '@/components/creation-button'
import ProductsTable from '@/components/products-table'
import { useProductsStore } from '@/store/products-store'
import { useRecipesStore } from '@/store/recipes-store'
import { useToolsStore } from '@/store/tools-store'
import type { Product } from '@/types'

const unitTypes = {
  g: 1,
  k: 1,
  ml: 2,
  l: 2
}

const unitValues = {
  g: 1,
  k: 1000,
  ml: 1,
  l: 1000
}

export default function RecipePage ({ params }: {
  params: { id: string }
}) {
  const [recipe, addIngredient, editIngredient, removeIngredient] = useRecipesStore(store => [store.recipes.find(r => r.id === params.id), store.addIngredient, store.editIngredient, store.removeIngredient])
  const ingredients = useProductsStore(store => recipe?.ingredients.reduce((pv: Product[], { productId, ...v }) => {
    const product = store.products.find(p => p.id === productId)

    if (product === undefined) return pv

    if (unitTypes[v.unit] !== unitTypes[product.unit]) return pv

    const price = ((v.quantity * unitValues[v.unit]) / (product.quantity * unitValues[product.unit])) * product.price
    return [...pv, { ...product, ...v, price }]
  }, []) ?? [])
  const setTools = useToolsStore(store => store.setTools)

  if (recipe === undefined) return <p>Cargando receta</p>

  const totalCost = ingredients.reduce((pv, v) => pv + v.price, 0)

  return (
    <>
      <h1 className='text-3xl font-bold'>{recipe.name} recipe</h1>

      <section className='space-y-4'>
        <div className='flex justify-between'>
          <h2 className='text-2xl font-semibold mb-2'>Ingredients:</h2>
          <CreationButton onClick={() => {
            setTools({
              type: 'ingredient',
              action: 'create',
              formData: undefined,
              manageValues (values) {
                if ('productId' in values) {
                  addIngredient(recipe.id, values)
                }
              }
            })
          }} elementType='ingredient' />
        </div>

        {ingredients.length > 0 && <ProductsTable
          products={ingredients}
          editProduct={(product) => {
            setTools({
              type: 'ingredient',
              action: 'update',
              formData: {
                productId: product.id,
                unit: product.unit,
                quantity: product.quantity
              },
              manageValues (values) {
                if ('productId' in values) {
                  editIngredient(recipe.id, product.id, values)
                }
              }
            })
          }}
          removeProduct={(productId) => {
            removeIngredient(recipe.id, productId)
          }}
        />}
      </section>

      {ingredients.length > 0 && <p className='text-center text-lg'>Total cost: <strong>${totalCost.toFixed(2)}</strong></p>}
    </>
  )
}
