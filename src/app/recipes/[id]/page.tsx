'use client'

import CreationButton from '@/components/creation-button'
import ProductsTable from '@/components/products-table'
import { useProductsStore } from '@/store/products-store'
import { useRecipesStore } from '@/store/recipes-store'
import { useToolsStore } from '@/store/form-store'
import type { Product } from '@/types'
import { UNIT_TYPES, UNIT_VALUES } from '@/utils/constants'

export default function RecipePage ({ params }: {
  params: { id: string }
}) {
  const [recipe, addIngredient, editIngredient, removeIngredient] = useRecipesStore(store => [store.recipes.find(r => r.id === params.id), store.addIngredient, store.editIngredient, store.removeIngredient])
  const ingredients = useProductsStore(store => recipe?.ingredients.reduce((pv: Product[], { productId, ...v }) => {
    const product = store.products.find(p => p.id === productId)

    if (product === undefined) return pv

    if (UNIT_TYPES[v.unit] !== UNIT_TYPES[product.unit]) return pv

    const price = ((v.quantity * UNIT_VALUES[v.unit]) / (product.quantity * UNIT_VALUES[product.unit])) * product.price
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
              defaultValues: undefined,
              manageValues (values) {
                if ('productId' in values) {
                  addIngredient(recipe.id, values)
                }
              },
              ingredients
            })
          }} elementType='ingredient' />
        </div>

        {ingredients.length > 0 && <ProductsTable
          products={ingredients}
          editProduct={(product) => {
            setTools({
              type: 'ingredient',
              action: 'update',
              defaultValues: {
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
