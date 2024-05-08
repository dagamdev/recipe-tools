import Link from 'next/link'
import type { Recipe } from '@/types'
import { Button } from './ui/button'
import { MoreHorizontalIcon, EditIcon, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRecipesStore } from '@/store/recipes-store'
import { useToolsStore } from '@/store/tools-store'

export default function RecipeCard ({ recipe }: {
  recipe: Recipe
}) {
  const [editRecipe, removeRecipe] = useRecipesStore(store => [store.editRecipe, store.removeRecipe])
  const setTools = useToolsStore(store => store.setTools)

  return (
    <li className='flex items-center border-2 border-border rounded-lg'>
      <Link href={`/recipes/${recipe.id}`}
        className='w-full p-3 block'
      >
        <strong>{recipe.name}</strong>
        <p className='text-sm text-muted-foreground'>Ingredients: {recipe.ingredients.length}</p>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='m-3'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => {
            setTools({
              type: 'product',
              action: 'update',
              formData: recipe,
              manageValues (values) {
                if ('name' in values) {
                  editRecipe(recipe.id, values)
                }
              }
            })
          }}>
            <EditIcon className='size-4 mr-2'/> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className='text-red-500' onClick={() => { removeRecipe(recipe.id) }}>
            <Trash2 className='size-4 mr-2'/> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
