import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchBox } from '@/components/search-box'
import { requireUserId } from '@/lib/auth'
import { baseUnitOf, pricePerBaseUnit } from '@/lib/costing'
import { loadWorkspace } from '@/lib/data'
import { ProductList, type ProductView } from './product-list'

export const metadata: Metadata = { title: 'Insumos' }

export default async function ProductsPage ({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const userId = await requireUserId()
  const { q = '' } = await searchParams
  const ws = await loadWorkspace(userId)
  const query = q.trim().toLocaleLowerCase('es')

  const products: ProductView[] = ws.products
    .filter(p => query === '' || p.name.toLocaleLowerCase('es').includes(query))
    .map(p => ({
      id: p.id,
      name: p.name,
      packageQty: p.packageQty,
      unit: p.unit,
      price: p.price,
      wastePct: p.wastePct,
      unitPrice: pricePerBaseUnit(p),
      baseUnit: baseUnitOf(p.unit),
      uses: ws.productUsage.get(p.id)?.size ?? 0,
      change: ws.priceChanges.get(p.id)?.ratio ?? null,
      history: (ws.history.get(p.id) ?? []).slice(0, 6).map(h => ({
        id: h.id,
        price: h.price,
        packageQty: h.packageQty,
        unit: h.unit,
        at: h.recordedAt.toISOString()
      }))
    }))

  return (
    <main className='flex flex-col gap-3.5 px-5 pt-7 pb-20'>
      <header className='flex flex-col gap-0.5'>
        <span className='text-sm font-medium text-muted'>Lo que compras</span>
        <h1 className='font-display text-[32px] leading-tight font-bold tracking-tight'>Insumos</h1>
      </header>
      {ws.products.length > 0 && (
        <Suspense>
          <SearchBox label='Buscar insumo' placeholder='Buscar insumo' />
        </Suspense>
      )}
      <ProductList products={products} hasAny={ws.products.length > 0} />
    </main>
  )
}
