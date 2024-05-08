'use client'

import { useRecipesStore } from '@/store/recipes-store'
import RecipeCard from './recipe'
import CreationButton from './creation-button'
import { useToolsStore } from '@/store/tools-store'

export default function RecipeList () {
  const [recipes, addRecipe] = useRecipesStore(store => [store.recipes, store.addRecipe])
  const setTools = useToolsStore(store => store.setTools)

  return (
    <section className='space-y-4'>
      <div className='flex justify-between'>
        <h3 className='text-2xl font-bold'>Recipes:</h3>
        <CreationButton onClick={() => {
          setTools({
            type: 'recipe',
            action: 'create',
            manageValues (values) {
              if ('name' in values) {
                addRecipe({ ...values, ingredients: [] })
              }
            },
            formData: undefined
          })
        }} elementType='recipe' />
      </div>

      <ul className='flex flex-col gap-y-4'>
        {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </ul>
    </section>
  )
}
