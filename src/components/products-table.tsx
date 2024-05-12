import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from './ui/table'
import type { Product } from '@/types'
import { MoreHorizontal, Trash2, EditIcon } from 'lucide-react'

export default function ProductsTable ({ products, caption, editProduct, removeProduct }: {
  products: Product[]
  editProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  caption?: string
}) {
  return (
    <Table className='border border-border'>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Price</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(p => <TableRow key={p.id}>
          <TableCell>{p.name}</TableCell>
          <TableCell>{p.quantity}</TableCell>
          <TableCell>{p.unit}</TableCell>
          <TableCell>${p.price.toFixed(2)}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' >
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => { editProduct(p) }}>
                  <EditIcon className='size-4 mr-2'/> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-500' onClick={() => { removeProduct(p.id) }}>
                  <Trash2 className='size-4 mr-2'/> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>)}
      </TableBody>
      {caption !== undefined && <TableCaption>{caption}</TableCaption>}
    </Table>
  )
}
