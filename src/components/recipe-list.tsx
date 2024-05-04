'use client'

import { useRecipesStore } from '@/store/recipes-store'
import RecipeCard from './recipe'

export default function RecipeList () {
  const recipes = useRecipesStore(store => store.recipes)

  return (
    <ul>
      {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
    </ul>
  )
}
