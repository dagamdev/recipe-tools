import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireUserId } from '@/lib/auth'
import { loadWorkspace } from '@/lib/data'
import { formatMoney, formatNumber } from '@/lib/format'
import { RecipeDetail, type ItemView, type SourceOption } from './recipe-detail'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata ({ params }: Props): Promise<Metadata> {
  const userId = await requireUserId()
  const { id } = await params
  const ws = await loadWorkspace(userId)
  return { title: ws.recipes.find(r => r.id === id)?.name ?? 'Receta' }
}

export default async function RecipePage ({ params }: Props) {
  const userId = await requireUserId()
  const { id } = await params
  const ws = await loadWorkspace(userId)
  const recipe = ws.recipes.find(r => r.id === id)
  if (recipe === undefined) notFound()

  const cost = ws.costs.get(recipe.id)
  const total = cost?.total ?? 0
  const costById = new Map(cost?.items.map(i => [i.id, i]) ?? [])
  const productById = new Map(ws.products.map(p => [p.id, p]))
  const recipeById = new Map(ws.recipes.map(r => [r.id, r]))

  // Modelo de vista ya calculado para el componente cliente
  const items: ItemView[] = ws.items
    .filter(i => i.recipeId === recipe.id)
    .map(item => {
      const c = costById.get(item.id)
      const product = item.productId !== null ? productById.get(item.productId) : undefined
      const sub = item.subrecipeId !== null ? recipeById.get(item.subrecipeId) : undefined
      const parts: string[] = []
      if (product !== undefined) {
        parts.push(`${formatNumber(item.quantity)} ${item.unit ?? product.unit}`)
        if (item.wastePct > 0) parts.push(`merma ${formatNumber(item.wastePct)}%`)
        parts.push(`${formatMoney(product.price)}/${formatNumber(product.packageQty)} ${product.unit}`)
      } else if (sub !== undefined) {
        parts.push(`Subreceta · ${formatNumber(item.quantity)} ${sub.yieldLabel}`)
        if (item.wastePct > 0) parts.push(`merma ${formatNumber(item.wastePct)}%`)
      }
      const priceChange = product !== undefined ? ws.priceChanges.get(product.id) : undefined
      return {
        id: item.id,
        source: product !== undefined ? `p:${product.id}` : `r:${item.subrecipeId}`,
        name: product?.name ?? sub?.name ?? 'Eliminado',
        detail: parts.join(' · '),
        cost: c?.cost ?? 0,
        share: total > 0 ? (c?.cost ?? 0) / total : 0,
        issue: c?.issue ?? null,
        rising: priceChange !== undefined && priceChange.ratio > 0,
        quantity: item.quantity,
        unit: item.unit,
        wastePct: item.wastePct
      }
    })
    .sort((a, b) => b.cost - a.cost)

  // Opciones para agregar: insumos y subrecetas (sin la receta actual)
  const sources: SourceOption[] = [
    ...ws.products.map(p => ({
      key: `p:${p.id}`,
      kind: 'product' as const,
      name: p.name,
      unit: p.unit,
      packageQty: p.packageQty,
      price: p.price,
      wastePct: p.wastePct,
      perYield: 0,
      yieldLabel: ''
    })),
    ...ws.recipes.filter(r => r.isSubrecipe && r.id !== recipe.id).map(r => ({
      key: `r:${r.id}`,
      kind: 'recipe' as const,
      name: r.name,
      unit: null,
      packageQty: 0,
      price: 0,
      wastePct: 0,
      perYield: ws.costs.get(r.id)?.perYield ?? 0,
      yieldLabel: r.yieldLabel
    }))
  ]

  return (
    <RecipeDetail
      recipe={{
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        yieldQty: recipe.yieldQty,
        yieldLabel: recipe.yieldLabel,
        salePrice: recipe.salePrice,
        isSubrecipe: recipe.isSubrecipe
      }}
      total={total}
      items={items}
      sources={sources}
      categories={ws.categories}
    />
  )
}
