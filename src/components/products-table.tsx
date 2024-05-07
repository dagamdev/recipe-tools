import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from './ui/table'
import type { Product } from '@/types'
import { MoreHorizontal, Trash2, EditIcon } from 'lucide-react'

export default function ProductsTable ({ products, caption, editProduct, deleteProduct }: {
  products: Product[]
  editProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  caption?: string
}) {
  return (
    <Table>
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
          <TableCell>${p.price}</TableCell>
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
                  <EditIcon /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { deleteProduct(p.id) }}>
                  <Trash2 /> Delete
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
