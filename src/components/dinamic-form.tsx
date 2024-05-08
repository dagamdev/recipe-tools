import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { cn } from '@/lib/utils'
import { useToolsStore, type Types } from '@/store/tools-store'
import type { RecipeProduct, Units } from '@/types'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useProductsStore } from '@/store/products-store'

export default function DinamicForm ({ type, className, defaultValues }: {
  type: Types
  className?: string
  defaultValues?: RecipeProduct
}) {
  const [unit, setUnit] = useState(defaultValues === undefined
    ? ''
    : 'unit' in defaultValues
      ? defaultValues.unit
      : ''
  )
  const [unitMessage, setUnitMessage] = useState<string>()
  const [productId, setProductId] = useState<string>(defaultValues === undefined
    ? ''
    : 'productId' in defaultValues
      ? defaultValues.productId
      : ''
  )
  const [setOpen, manageValues] = useToolsStore(store => [store.setOpen, store.manageValues])
  const products = useProductsStore(store => store.products)

  const getDefaultValue = (name: string): string | number | undefined => {
    if (defaultValues === undefined) return undefined
    if (name in defaultValues) return defaultValues[name as keyof RecipeProduct]
    return undefined
  }

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    const formData = new FormData(ev.currentTarget)
    const name = formData.get('name')?.toString() ?? ''
    const quantity = parseFloat(formData.get('quantity')?.toString() ?? '1')
    const price = parseFloat(formData.get('price')?.toString() ?? '0')

    if (type === 'recipe') {
      manageValues({ name })
    } else if (type === 'product') {
      if (unit.length === 0) {
        setUnitMessage('Please select a product unit.')
        return
      }

      manageValues({
        name,
        quantity,
        unit: unit as Units,
        price
      })
    } else {
      manageValues({
        productId,
        quantity,
        unit: unit as Units,
        price
      })
    }

    setOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('grid items-start gap-4', className)}>
      {type !== 'ingredient' && <Label className="grid gap-2">
        Name
        <Input name='name' defaultValue={getDefaultValue('name')} required />
      </Label>}

      {type === 'ingredient' && <Label className="grid gap-2">
        Product
        <Select onValueChange={setProductId} defaultValue={getDefaultValue('productId') as string}>
          <SelectTrigger className="">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {unitMessage !== undefined && <span className='text-red-500'>{unitMessage}</span>}
      </Label>}

      {type !== 'recipe' && <>
          <div className='grid grid-cols-2 gap-4'>
            <Label className="grid gap-2">
              Quantity
              <Input name='quantity' type='number' defaultValue={getDefaultValue('quantity')} required />
            </Label>
            <Label className="grid gap-2">
              Unit of measurement
              <Select onValueChange={setUnit} defaultValue={getDefaultValue('unit') as string}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g" >g</SelectItem>
                  <SelectItem value="k">k</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
              {unitMessage !== undefined && <span className='text-red-500'>{unitMessage}</span>}
            </Label>
          </div>
        </>
      }
      {type === 'product' && <Label className="grid gap-2">
        Price
        <Input name='price' type='number' defaultValue={getDefaultValue('price')} required />
      </Label>}

      {<Button type="submit">{defaultValues === undefined ? 'Create new' : 'Save changes'}</Button>}
    </form>
  )
}
