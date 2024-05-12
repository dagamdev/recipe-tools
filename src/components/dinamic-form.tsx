import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { cn } from '@/lib/utils'
import { useFormStore } from '@/store/form-store'
import type { RecipeProduct, Units } from '@/types'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useProductsStore } from '@/store/products-store'
import { UNIT_TYPES } from '@/utils/constants'

export default function DinamicForm ({ className }: {
  className?: string
}) {
  const [type, setOpen, defaultValues, manageValues, ingredients] = useFormStore(store => [store.type, store.setOpen, store.defaultValues, store.manageValues, store.ingredients])
  const [unit, setUnit] = useState(() => {
    if (defaultValues !== undefined && 'unit' in defaultValues) {
      return defaultValues.unit
    }
  })
  const [unitMessage, setUnitMessage] = useState<string>()
  const [productId, setProductId] = useState<string>(defaultValues === undefined
    ? ''
    : 'productId' in defaultValues
      ? defaultValues.productId
      : ''
  )
  const products = useProductsStore(store => store.products)
  const [priceMessage, setPriceMessage] = useState<string>()
  const [unitType, setUnitType] = useState(unit === undefined ? 0 : UNIT_TYPES[unit])

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

    if (isNaN(price)) {
      setPriceMessage('Price is not a number')
      return
    }

    if (type === 'recipe') {
      manageValues({ name })
    } else if (type === 'product') {
      if (unit === undefined) {
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
      if (unit === undefined) {
        setUnitMessage('Please select a product unit.')
        return
      }

      manageValues({
        productId,
        quantity,
        unit: unit as Units,
        price
      })
    }

    setOpen(false)
  }

  const handleSetProduct = (value: string) => {
    setProductId(value)
    const product = products.find(p => p.id === value)

    if (product !== undefined) {
      setUnit(product.unit)
      setUnitType(UNIT_TYPES[product.unit])
    }
  }

  console.log({ unitType, unit })

  return (
    <form onSubmit={handleSubmit} className={cn('grid items-start gap-4 max-w-lg', className)}>
      {type !== 'ingredient' && <Label className="grid gap-2">
        Name
        <Input name='name' defaultValue={getDefaultValue('name')} required />
      </Label>}

      {ingredients !== undefined && <Label className="grid gap-2">
        Product
        <Select onValueChange={handleSetProduct} defaultValue={getDefaultValue('productId') as string}>
          <SelectTrigger>
            <SelectValue placeholder="Reference product" />
          </SelectTrigger>
          <SelectContent>
            {products.filter(p => !ingredients.some(i => i.id === p.id)).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
              <Select key={unitType}
                onValueChange={(v) => { setUnit(v as Units) }}
                defaultValue={getDefaultValue('unit') as string}
                value={unit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_TYPES)
                    .filter(([unit, type]) => (unitType === 0 ? true : type === unitType))
                    .map(([unit]) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                </SelectContent>
              </Select>
              {unitMessage !== undefined && <span className='text-red-500'>{unitMessage}</span>}
            </Label>
          </div>
        </>
      }
      {type === 'product' && <Label className="grid gap-2">
        Price
        <Input name='price' defaultValue={getDefaultValue('price')} required />
        {priceMessage !== undefined && <span className='text-red-500'>{priceMessage}</span>}
      </Label>}

      {<Button type="submit">{defaultValues === undefined ? 'Create new' : 'Save changes'}</Button>}
    </form>
  )
}
