import { type Product } from '@/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { EditIcon, MoreHorizontal, Trash2 } from 'lucide-react'

export default function ProductCard ({ product, editProduct, removeProduct }: {
  product: Product
  editProduct: (product: Product) => void
  removeProduct: (productId: string) => void
}) {
  return (
    <li className='flex justify-between items-center gap-x-4'>
      <div className='flex justify-between max-w-xl w-full'>
        <p>{product.quantity}{product.unit} {product.name}</p>
        <span>${product.price}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' >
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => { editProduct(product) }}>
            <EditIcon className='size-4 mr-2'/> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className='text-red-500' onClick={() => { removeProduct(product.id) }}>
            <Trash2 className='size-4 mr-2'/> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
