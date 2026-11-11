// Aplica las migraciones de /drizzle a DATABASE_URL.
// Usa postgres-js con prepare: false para funcionar con el pooler de Supabase en modo transacción.
// Vercel lo ejecuta antes de cada build (script vercel-build).
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const root = process.cwd()

function readDatabaseUrl (): string | undefined {
  if (process.env.DATABASE_URL !== undefined && process.env.DATABASE_URL !== '') return process.env.DATABASE_URL
  for (const file of ['.env.local', '.env']) {
    const full = path.join(root, file)
    if (!existsSync(full)) continue
    const value = parseEnv(readFileSync(full, 'utf8')).DATABASE_URL
    if (value !== undefined && value !== '') return value
  }
  return undefined
}

const url = readDatabaseUrl()
if (url === undefined) {
  console.error('Falta DATABASE_URL: no hay base a la cual aplicar las migraciones.')
  process.exit(1)
}

const client = postgres(url, { prepare: false, max: 1, onnotice: () => {} })
try {
  await migrate(drizzle(client), { migrationsFolder: path.join(root, 'drizzle') })
  console.log('[db] migraciones aplicadas')
} finally {
  await client.end()
}
