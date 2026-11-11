import 'server-only'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type Db = PostgresJsDatabase<typeof schema>

// En producción DATABASE_URL apunta a Supabase/Neon; en desarrollo `pnpm dev` la define hacia PGlite
function createDb (): Db {
  const url = process.env.DATABASE_URL
  if (url === undefined || url === '') {
    throw new Error('Falta DATABASE_URL. En desarrollo inicia la app con `pnpm dev`.')
  }
  // prepare: false para que funcione con el pooler en modo transacción de Supabase.
  // DATABASE_POOL_MAX=1 en desarrollo: el servidor de PGlite mezcla respuestas de conexiones simultáneas.
  const max = Number(process.env.DATABASE_POOL_MAX ?? 5)
  const client = postgres(url, { prepare: false, max })
  return drizzle(client, { schema })
}

// Una sola conexión por proceso, también entre recargas en desarrollo
const globalForDb = globalThis as unknown as { escandalloDb?: Db }
export const db = globalForDb.escandalloDb ??= createDb()
