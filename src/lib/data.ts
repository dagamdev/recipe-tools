import 'server-only'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/db'
import { priceHistory, products, recipeItems, recipes } from '@/db/schema'
import { computeCosts, pricePerBaseUnit, type RecipeCost } from './costing'

export type Product = typeof products.$inferSelect
export type Recipe = typeof recipes.$inferSelect
export type RecipeItem = typeof recipeItems.$inferSelect
export type PriceEntry = typeof priceHistory.$inferSelect

export interface PriceChange { ratio: number, at: Date }

export interface Workspace {
  products: Product[]
  recipes: Recipe[]
  items: RecipeItem[]
  costs: Map<string, RecipeCost>
  // Último cambio de precio por insumo (comparando precio por unidad base)
  priceChanges: Map<string, PriceChange>
  history: Map<string, PriceEntry[]>
  // Recetas que usan cada insumo
  productUsage: Map<string, Set<string>>
  categories: string[]
}

// Carga todo lo del usuario de una vez: un recetario personal es pequeño
// y así el costo de subrecetas se resuelve en memoria
export const loadWorkspace = cache(async (userId: string): Promise<Workspace> => {
  const [productRows, recipeRows] = await Promise.all([
    db.select().from(products).where(eq(products.userId, userId)).orderBy(asc(products.name)),
    db.select().from(recipes).where(eq(recipes.userId, userId)).orderBy(asc(recipes.name))
  ])

  const recipeIds = recipeRows.map(r => r.id)
  const productIds = productRows.map(p => p.id)

  const [itemRows, historyRows] = await Promise.all([
    recipeIds.length === 0
      ? []
      : db.select().from(recipeItems).where(inArray(recipeItems.recipeId, recipeIds)).orderBy(asc(recipeItems.position), asc(recipeItems.createdAt)),
    productIds.length === 0
      ? []
      : db.select().from(priceHistory).where(inArray(priceHistory.productId, productIds)).orderBy(desc(priceHistory.recordedAt))
  ])

  const costs = computeCosts(recipeRows, itemRows, productRows)

  const history = new Map<string, PriceEntry[]>()
  for (const entry of historyRows) {
    const list = history.get(entry.productId) ?? []
    list.push(entry)
    history.set(entry.productId, list)
  }

  const priceChanges = new Map<string, PriceChange>()
  for (const [productId, entries] of history) {
    if (entries.length < 2) continue
    const [latest, previous] = entries
    const before = pricePerBaseUnit(previous)
    if (before === 0) continue
    const ratio = pricePerBaseUnit(latest) / before - 1
    if (Math.abs(ratio) >= 0.005) priceChanges.set(productId, { ratio, at: latest.recordedAt })
  }

  const productUsage = new Map<string, Set<string>>()
  for (const item of itemRows) {
    if (item.productId === null) continue
    const set = productUsage.get(item.productId) ?? new Set<string>()
    set.add(item.recipeId)
    productUsage.set(item.productId, set)
  }

  const categories = [...new Set(recipeRows.map(r => r.category).filter((c): c is string => c !== null && c !== ''))]
    .sort((a, b) => a.localeCompare(b, 'es'))

  return { products: productRows, recipes: recipeRows, items: itemRows, costs, priceChanges, history, productUsage, categories }
})

// El insumo que más subió en los últimos `days` días y que se usa en alguna receta
export function topPriceIncrease (ws: Workspace, days: number) {
  const since = Date.now() - days * 864e5
  return ws.products
    .flatMap(product => {
      const change = ws.priceChanges.get(product.id)
      const uses = ws.productUsage.get(product.id)?.size ?? 0
      return change !== undefined && change.ratio > 0 && change.at.getTime() >= since && uses > 0
        ? [{ product, change, uses }]
        : []
    })
    .sort((a, b) => b.change.ratio - a.change.ratio)[0]
}
