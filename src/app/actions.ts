'use server'

import { and, eq, inArray, isNotNull, max, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db'
import { priceHistory, products, recipeItems, recipes, UNITS } from '@/db/schema'
import { requireUserId } from '@/lib/auth'
import { wouldCreateCycle } from '@/lib/costing'

export interface ActionState { error?: string, ok?: boolean }

// Acepta "12,5" y "12.5"
const decimal = z.preprocess(
  v => typeof v === 'string' ? Number(v.replace(',', '.').trim()) : v,
  z.number({ error: 'Escribe un número' }).finite('Escribe un número')
)
const optionalDecimal = z.preprocess(
  v => v === '' || v === null || v === undefined ? null : v,
  decimal.nullable()
)
const text = (max: number) => z.string().trim().max(max)

function firstError (error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos no válidos'
}

function refresh () {
  revalidatePath('/', 'layout')
}

// ---------- Insumos ----------

const productSchema = z.object({
  name: text(80).min(1, 'Ponle un nombre'),
  packageQty: decimal.refine(v => v > 0, 'La cantidad debe ser mayor a 0'),
  unit: z.enum(UNITS, { error: 'Elige una unidad' }),
  price: decimal.refine(v => v >= 0, 'El precio no puede ser negativo'),
  wastePct: optionalDecimal.transform(v => v ?? 0).refine(v => v >= 0 && v <= 95, 'La merma va de 0 a 95%')
})

export async function saveProduct (productId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) }
  const values = parsed.data

  if (productId === null) {
    await db.transaction(async tx => {
      const [created] = await tx.insert(products).values({ ...values, userId }).returning({ id: products.id })
      await tx.insert(priceHistory).values({ productId: created.id, packageQty: values.packageQty, unit: values.unit, price: values.price })
    })
  } else {
    const [current] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.userId, userId)))
    if (current === undefined) return { error: 'Ese insumo ya no existe' }

    const priceChanged = current.price !== values.price || current.packageQty !== values.packageQty || current.unit !== values.unit
    await db.transaction(async tx => {
      await tx.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, productId))
      if (priceChanged) {
        await tx.insert(priceHistory).values({ productId, packageQty: values.packageQty, unit: values.unit, price: values.price })
      }
    })
  }

  refresh()
  return { ok: true }
}

export async function deleteProduct (productId: string): Promise<ActionState> {
  const userId = await requireUserId()
  const usage = await db
    .select({ count: sql<number>`count(distinct ${recipeItems.recipeId})::int` })
    .from(recipeItems)
    .innerJoin(products, eq(products.id, recipeItems.productId))
    .where(and(eq(recipeItems.productId, productId), eq(products.userId, userId)))
  const count = usage[0]?.count ?? 0
  if (count > 0) {
    return { error: `Se usa en ${count} ${count === 1 ? 'receta' : 'recetas'}. Quítalo de ahí primero.` }
  }
  await db.delete(products).where(and(eq(products.id, productId), eq(products.userId, userId)))
  refresh()
  return { ok: true }
}

// ---------- Recetas ----------

const recipeSchema = z.object({
  name: text(80).min(1, 'Ponle un nombre'),
  category: text(40).transform(v => v === '' ? null : v),
  yieldQty: decimal.refine(v => v > 0, 'El rendimiento debe ser mayor a 0'),
  yieldLabel: text(20).min(1, 'Indica en qué se mide el rendimiento'),
  salePrice: optionalDecimal.refine(v => v === null || v >= 0, 'El precio no puede ser negativo'),
  isSubrecipe: z.preprocess(v => v === 'on' || v === true, z.boolean())
})

export async function createRecipe (_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = recipeSchema.safeParse({ ...Object.fromEntries(formData), isSubrecipe: formData.get('isSubrecipe') })
  if (!parsed.success) return { error: firstError(parsed.error) }

  const [created] = await db.insert(recipes).values({ ...parsed.data, userId }).returning({ id: recipes.id })
  refresh()
  redirect(`/recetas/${created.id}`)
}

export async function updateRecipeDetails (recipeId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = recipeSchema.safeParse({ ...Object.fromEntries(formData), isSubrecipe: formData.get('isSubrecipe') })
  if (!parsed.success) return { error: firstError(parsed.error) }

  await db.update(recipes).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
  refresh()
  return { ok: true }
}

// Guardado rápido de rendimiento y precio desde el detalle de la receta
const quickSchema = z.object({
  yieldQty: z.number().finite().positive(),
  salePrice: z.number().finite().nonnegative().nullable()
})

export async function updateRecipePricing (recipeId: string, values: { yieldQty: number, salePrice: number | null }): Promise<ActionState> {
  const userId = await requireUserId()
  const parsed = quickSchema.safeParse(values)
  if (!parsed.success) return { error: 'Datos no válidos' }
  await db.update(recipes).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
  refresh()
  return { ok: true }
}

export async function deleteRecipe (recipeId: string): Promise<ActionState> {
  const userId = await requireUserId()
  const [usedIn] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recipeItems)
    .where(eq(recipeItems.subrecipeId, recipeId))
  if ((usedIn?.count ?? 0) > 0) {
    return { error: 'Esta subreceta se usa en otras recetas. Quítala de ahí primero.' }
  }
  await db.delete(recipes).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
  refresh()
  redirect('/recetas')
}

// ---------- Ingredientes de una receta ----------

const itemSchema = z.object({
  quantity: decimal.refine(v => v > 0, 'La cantidad debe ser mayor a 0'),
  unit: z.enum(UNITS).nullable(),
  wastePct: optionalDecimal.transform(v => v ?? 0).refine(v => v >= 0 && v <= 95, 'La merma va de 0 a 95%')
})

function parseItem (formData: FormData) {
  const unit = formData.get('unit')
  return itemSchema.safeParse({
    quantity: formData.get('quantity'),
    unit: typeof unit === 'string' && unit !== '' ? unit : null,
    wastePct: formData.get('wastePct')
  })
}

async function ownsRecipe (userId: string, recipeId: string): Promise<boolean> {
  const [row] = await db.select({ id: recipes.id }).from(recipes).where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
  return row !== undefined
}

export async function addRecipeItem (recipeId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  if (!await ownsRecipe(userId, recipeId)) return { error: 'Esa receta ya no existe' }

  // source tiene la forma "p:<id>" (insumo) o "r:<id>" (subreceta)
  const source = String(formData.get('source') ?? '')
  const [kind, sourceId] = source.split(':')
  if ((kind !== 'p' && kind !== 'r') || sourceId === undefined || sourceId === '') return { error: 'Elige un insumo o una subreceta' }

  const parsed = parseItem(formData)
  if (!parsed.success) return { error: firstError(parsed.error) }

  if (kind === 'p') {
    const [product] = await db.select({ id: products.id }).from(products).where(and(eq(products.id, sourceId), eq(products.userId, userId)))
    if (product === undefined) return { error: 'Ese insumo ya no existe' }
    if (parsed.data.unit === null) return { error: 'Elige una unidad' }
  } else {
    if (!await ownsRecipe(userId, sourceId)) return { error: 'Esa subreceta ya no existe' }
    // Revisar ciclos con todas las relaciones de subrecetas del usuario
    const userRecipes = db.select({ id: recipes.id }).from(recipes).where(eq(recipes.userId, userId))
    const links = await db.select().from(recipeItems).where(and(
      inArray(recipeItems.recipeId, userRecipes),
      isNotNull(recipeItems.subrecipeId)
    ))
    if (wouldCreateCycle(recipeId, sourceId, links)) {
      return { error: 'No se puede: esa subreceta ya usa esta receta.' }
    }
  }

  const [{ last }] = await db.select({ last: max(recipeItems.position) }).from(recipeItems).where(eq(recipeItems.recipeId, recipeId))
  await db.insert(recipeItems).values({
    recipeId,
    productId: kind === 'p' ? sourceId : null,
    subrecipeId: kind === 'r' ? sourceId : null,
    quantity: parsed.data.quantity,
    unit: kind === 'p' ? parsed.data.unit : null,
    wastePct: parsed.data.wastePct,
    position: (last ?? -1) + 1
  })
  await db.update(recipes).set({ updatedAt: new Date() }).where(eq(recipes.id, recipeId))

  refresh()
  return { ok: true }
}

async function ownedItem (userId: string, itemId: string) {
  const [row] = await db
    .select({ id: recipeItems.id, recipeId: recipeItems.recipeId, productId: recipeItems.productId })
    .from(recipeItems)
    .innerJoin(recipes, eq(recipes.id, recipeItems.recipeId))
    .where(and(eq(recipeItems.id, itemId), eq(recipes.userId, userId)))
  return row
}

export async function updateRecipeItem (itemId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId()
  const item = await ownedItem(userId, itemId)
  if (item === undefined) return { error: 'Ese ingrediente ya no existe' }

  const parsed = parseItem(formData)
  if (!parsed.success) return { error: firstError(parsed.error) }
  if (item.productId !== null && parsed.data.unit === null) return { error: 'Elige una unidad' }

  await db.update(recipeItems).set({
    quantity: parsed.data.quantity,
    unit: item.productId !== null ? parsed.data.unit : null,
    wastePct: parsed.data.wastePct
  }).where(eq(recipeItems.id, itemId))

  refresh()
  return { ok: true }
}

export async function deleteRecipeItem (itemId: string): Promise<ActionState> {
  const userId = await requireUserId()
  const item = await ownedItem(userId, itemId)
  if (item === undefined) return { error: 'Ese ingrediente ya no existe' }
  await db.delete(recipeItems).where(eq(recipeItems.id, itemId))
  refresh()
  return { ok: true }
}
