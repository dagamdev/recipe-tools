// Cálculo de costos. Sin dependencias para poder probarlo con node --test.

export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pz'
type Dimension = 'mass' | 'volume' | 'count'

const UNIT_INFO: Record<Unit, { dimension: Dimension, factor: number }> = {
  g: { dimension: 'mass', factor: 1 },
  kg: { dimension: 'mass', factor: 1000 },
  ml: { dimension: 'volume', factor: 1 },
  l: { dimension: 'volume', factor: 1000 },
  pz: { dimension: 'count', factor: 1 }
}

export const UNIT_LABELS: Record<Unit, string> = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', pz: 'pz' }

// Unidades con las que se puede medir un insumo comprado en `unit`
export function compatibleUnits (unit: Unit): Unit[] {
  const { dimension } = UNIT_INFO[unit]
  return (Object.keys(UNIT_INFO) as Unit[]).filter(u => UNIT_INFO[u].dimension === dimension)
}

export function sameDimension (a: Unit, b: Unit): boolean {
  return UNIT_INFO[a].dimension === UNIT_INFO[b].dimension
}

// Precio por unidad base (g, ml o pz)
export function pricePerBaseUnit (product: { packageQty: number, unit: Unit, price: number }): number {
  const base = product.packageQty * UNIT_INFO[product.unit].factor
  return base > 0 ? product.price / base : 0
}

export function baseUnitOf (unit: Unit): Unit {
  const { dimension } = UNIT_INFO[unit]
  return dimension === 'mass' ? 'g' : dimension === 'volume' ? 'ml' : 'pz'
}

// La merma encarece: para usar 250 g con 15% de merma hay que comprar 294 g
export function applyWaste (cost: number, wastePct: number): number {
  const w = Math.min(95, Math.max(0, wastePct)) / 100
  return cost / (1 - w)
}

// Costo de usar `quantity` `unit` de un insumo; null si las unidades no son compatibles
export function productItemCost (
  product: { packageQty: number, unit: Unit, price: number },
  quantity: number,
  unit: Unit,
  wastePct: number
): number | null {
  if (!sameDimension(unit, product.unit)) return null
  return applyWaste(quantity * UNIT_INFO[unit].factor * pricePerBaseUnit(product), wastePct)
}

export interface ProductInput { id: string, packageQty: number, unit: Unit, price: number }
export interface RecipeInput { id: string, yieldQty: number }
export interface ItemInput {
  id: string
  recipeId: string
  productId: string | null
  subrecipeId: string | null
  quantity: number
  unit: Unit | null
  wastePct: number
}

export type ItemIssue = 'units' | 'cycle' | 'missing'
export interface ItemCost { id: string, cost: number, issue?: ItemIssue }
export interface RecipeCost { total: number, perYield: number, items: ItemCost[], hasIssues: boolean }

// Calcula el costo de todas las recetas a la vez, resolviendo subrecetas y detectando ciclos
export function computeCosts (
  recipes: RecipeInput[],
  items: ItemInput[],
  products: ProductInput[]
): Map<string, RecipeCost> {
  const productById = new Map(products.map(p => [p.id, p]))
  const recipeById = new Map(recipes.map(r => [r.id, r]))
  const itemsByRecipe = new Map<string, ItemInput[]>()
  for (const item of items) {
    const list = itemsByRecipe.get(item.recipeId) ?? []
    list.push(item)
    itemsByRecipe.set(item.recipeId, list)
  }

  const result = new Map<string, RecipeCost>()
  const visiting = new Set<string>()

  const costOf = (recipeId: string): RecipeCost | null => {
    const done = result.get(recipeId)
    if (done !== undefined) return done
    // Si ya estamos calculando esta receta, hay un ciclo
    if (visiting.has(recipeId)) return null
    visiting.add(recipeId)

    const itemCosts: ItemCost[] = (itemsByRecipe.get(recipeId) ?? []).map(item => {
      if (item.productId !== null) {
        const product = productById.get(item.productId)
        if (product === undefined) return { id: item.id, cost: 0, issue: 'missing' }
        const cost = productItemCost(product, item.quantity, item.unit ?? product.unit, item.wastePct)
        if (cost === null) return { id: item.id, cost: 0, issue: 'units' }
        return { id: item.id, cost }
      }

      const sub = item.subrecipeId === null ? undefined : recipeById.get(item.subrecipeId)
      if (sub === undefined) return { id: item.id, cost: 0, issue: 'missing' }
      const subCost = costOf(sub.id)
      if (subCost === null) return { id: item.id, cost: 0, issue: 'cycle' }
      const raw = subCost.perYield * item.quantity
      return { id: item.id, cost: applyWaste(raw, item.wastePct) }
    })

    visiting.delete(recipeId)
    const total = itemCosts.reduce((sum, i) => sum + i.cost, 0)
    const yieldQty = recipeById.get(recipeId)?.yieldQty ?? 1
    const cost: RecipeCost = {
      total,
      perYield: yieldQty > 0 ? total / yieldQty : total,
      items: itemCosts,
      hasIssues: itemCosts.some(i => i.issue !== undefined)
    }
    result.set(recipeId, cost)
    return cost
  }

  for (const recipe of recipes) costOf(recipe.id)
  return result
}

// Semáforo del % de costo sobre el precio de venta
export type CostTone = 'good' | 'warn' | 'bad'
export function costTone (ratio: number): CostTone {
  if (ratio <= 0.30) return 'good'
  if (ratio <= 0.35) return 'warn'
  return 'bad'
}

// ¿Agregar `subrecipeId` a `recipeId` crearía un ciclo?
export function wouldCreateCycle (recipeId: string, subrecipeId: string, items: ItemInput[]): boolean {
  if (recipeId === subrecipeId) return true
  const children = new Map<string, string[]>()
  for (const item of items) {
    if (item.subrecipeId === null) continue
    const list = children.get(item.recipeId) ?? []
    list.push(item.subrecipeId)
    children.set(item.recipeId, list)
  }
  // Buscar si recipeId es alcanzable desde subrecipeId
  const stack = [subrecipeId]
  const seen = new Set<string>()
  while (stack.length > 0) {
    const current = stack.pop() as string
    if (current === recipeId) return true
    if (seen.has(current)) continue
    seen.add(current)
    stack.push(...(children.get(current) ?? []))
  }
  return false
}
