import { sql } from 'drizzle-orm'
import { boolean, check, index, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// ---------- Tablas de Better Auth ----------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
}, t => [index('session_user_idx').on(t.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, t => [index('account_user_idx').on(t.userId)])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// ---------- Tablas de la app ----------

// Unidades: masa (g, kg), volumen (ml, l) y conteo (pz)
export const UNITS = ['g', 'kg', 'ml', 'l', 'pz'] as const
export type Unit = typeof UNITS[number]

const money = (name: string) => numeric(name, { precision: 12, scale: 4, mode: 'number' })

// Insumos: lo que se compra, con su presentación y precio
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  packageQty: money('package_qty').notNull(),
  unit: text('unit', { enum: UNITS }).notNull(),
  price: money('price').notNull(),
  // Merma sugerida al agregarlo a una receta (0 a 95)
  wastePct: money('waste_pct').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, t => [index('products_user_idx').on(t.userId)])

// Historial: una fila cada vez que cambia el precio o la presentación
export const priceHistory = pgTable('price_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  packageQty: money('package_qty').notNull(),
  unit: text('unit', { enum: UNITS }).notNull(),
  price: money('price').notNull(),
  recordedAt: timestamp('recorded_at').notNull().defaultNow()
}, t => [index('price_history_product_idx').on(t.productId, t.recordedAt)])

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  // Rendimiento: cuántas porciones, piezas o tandas salen
  yieldQty: money('yield_qty').notNull().default(1),
  yieldLabel: text('yield_label').notNull().default('porciones'),
  // Precio de venta por unidad de rendimiento
  salePrice: money('sale_price'),
  isSubrecipe: boolean('is_subrecipe').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, t => [index('recipes_user_idx').on(t.userId)])

// Ingrediente de una receta: un insumo o una subreceta (nunca ambos)
export const recipeItems = pgTable('recipe_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }),
  subrecipeId: uuid('subrecipe_id').references(() => recipes.id, { onDelete: 'restrict' }),
  quantity: money('quantity').notNull(),
  // Para subrecetas la cantidad va en unidades de rendimiento de la subreceta y unit es null
  unit: text('unit', { enum: UNITS }),
  wastePct: money('waste_pct').notNull().default(0),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, t => [
  index('recipe_items_recipe_idx').on(t.recipeId),
  check('recipe_items_one_source', sql`(${t.productId} is null) <> (${t.subrecipeId} is null)`)
])
