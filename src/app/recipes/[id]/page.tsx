'use client'

import { useRecipesStore } from '@/store/recipes-store'

export default function RecipePage ({ params }: {
  params: { id: string }
}) {
  const recipe = useRecipesStore(store => store.recipes.find(r => r.id === params.id))

  if (recipe === undefined) return <p>Cargando receta</p>

  const totalCost = recipe.ingredients.reduce((pv, v) => pv + v.price, 0)

  return (
    <>
      <h1 className='text-3xl font-bold text-muted-foreground'>{recipe.name}</h1>

      <section>
        <h2 className='text-2xl font-semibold mb-2'>Ingredients:</h2>

        <ul>
          {recipe.ingredients.map(i => <li key={i.id}>
            {i.name} - {i.quantity}{i.unitOfMeasurement} = ${i.price}
          </li>)}
        </ul>
      </section>

      <p>Total cost: <strong>${totalCost}</strong></p>
    </>
  )
}
