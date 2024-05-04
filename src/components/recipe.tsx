import Link from 'next/link'
import type { Recipe } from '@/types'

export default function RecipeCard ({ recipe }: {
  recipe: Recipe
}) {
  return (
    <li>
      <Link href={`/recipes/${recipe.id}`}>
        <strong>{recipe.name}</strong>
      </Link>
    </li>
  )
}
