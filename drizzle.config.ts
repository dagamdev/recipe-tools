import { defineConfig } from 'drizzle-kit'

// Las migraciones se generan como SQL en /drizzle y sirven igual para PGlite y Postgres
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' }
})
