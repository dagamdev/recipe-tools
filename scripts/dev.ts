// Arranca el entorno de desarrollo.
// Sin DATABASE_URL levanta PGlite (Postgres embebido) como servidor local en el puerto 5433,
// aplica las migraciones y luego inicia `next dev` apuntando a él.
// Así la app usa siempre el mismo driver de Postgres, en local y en producción.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { parseEnv } from 'node:util'

const root = process.cwd()

// Solo se lee DATABASE_URL de los archivos .env. El resto lo carga Next por su cuenta,
// así sus cambios se aplican sin reiniciar (si se copiaran aquí, quedarían fijos).
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

const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')
const env = { ...process.env }
let stopDb = async () => {}

if (readDatabaseUrl() === undefined) {
  const { PGlite } = await import('@electric-sql/pglite')
  const { PGLiteSocketServer } = await import('@electric-sql/pglite-socket')
  const { drizzle } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')

  const dataDir = path.join(root, '.data', 'pglite')
  mkdirSync(dataDir, { recursive: true })
  const db = await PGlite.create(dataDir)
  await migrate(drizzle(db), { migrationsFolder: path.join(root, 'drizzle') })

  const port = Number(env.PGLITE_PORT ?? 5433)
  const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1', maxConnections: 20 })
  await server.start()
  console.log(`[db] PGlite escuchando en 127.0.0.1:${port} (datos en .data/pglite)`)

  env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres`
  env.DATABASE_POOL_MAX = '1'
  stopDb = async () => {
    await server.stop()
    await db.close()
  }
}

const next = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], { stdio: 'inherit', env })

const shutdown = async (code: number) => {
  await stopDb()
  process.exit(code)
}
next.on('exit', code => { void shutdown(code ?? 0) })
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { next.kill(signal) })
}
