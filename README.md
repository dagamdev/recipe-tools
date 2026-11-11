# Escandallo

Calcula el costo real de tus recetas a partir de lo que pagas por cada insumo.

- **Insumos** con su presentación (g, kg, ml, l, piezas), precio, merma sugerida e historial de precios.
- **Recetas** con rendimiento (porciones, piezas, tandas…), precio de venta, % de costo, ganancia y precio sugerido para quedar en 30% de costo.
- **Subrecetas**: una salsa, masa o relleno que se usa dentro de otras recetas. Se detectan ciclos.
- **Merma** por ingrediente: para usar 250 g con 15% de merma se cobran 294 g.
- **Avisos** cuando sube un insumo y a cuántas recetas afecta.
- Cuentas de usuario: cada quien ve solo sus datos.

> La versión anterior (solo navegador, con `localStorage`) está en la rama `legacy-v1`.

## Tecnología

- Next.js 16 (App Router, Server Actions) + React 19
- Tailwind CSS 4, sin librería de componentes
- PostgreSQL con Drizzle ORM (Supabase o Neon en producción)
- Better Auth (correo y contraseña; Google opcional)
- PGlite (Postgres embebido) para desarrollo local, sin Docker

## Desarrollo local

```bash
pnpm install
cp .env.example .env.local   # y pon un BETTER_AUTH_SECRET
pnpm dev
```

`pnpm dev` levanta PGlite como servidor Postgres en el puerto 5433 (datos en `.data/`), aplica las migraciones e inicia Next en http://localhost:3000. Si defines `DATABASE_URL`, usa esa base en su lugar.

Crea una cuenta desde `/login`. La base local de este equipo ya tiene una cuenta de prueba: `demo@escandallo.test` / `escandallo-demo`.

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `pnpm test` | Pruebas del cálculo de costos |
| `pnpm typecheck` | Revisión de tipos |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Genera una migración tras cambiar `src/db/schema.ts` |
| `pnpm db:migrate` | Aplica las migraciones a `DATABASE_URL` |

## Despliegue (Vercel + Supabase)

1. Crea un proyecto en Supabase y copia la cadena de conexión del **pooler en modo transacción** (puerto 6543).
2. En Vercel, define las variables:
   - `DATABASE_URL`: la cadena anterior
   - `BETTER_AUTH_SECRET`: genera una con `openssl rand -base64 32`
   - `BETTER_AUTH_URL`: la URL pública de la app
   - Opcional: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. Aplica las migraciones una vez (y cada vez que haya nuevas):

   ```bash
   DATABASE_URL="<cadena de conexión>" pnpm db:migrate
   ```

## Estructura

```
src/
  app/
    (app)/            pantallas con sesión: recetas, detalle, insumos, cuenta
    login/            entrar y crear cuenta
    actions.ts        Server Actions (validación con Zod)
  components/         piezas de interfaz (hoja inferior, barra de pestañas…)
  db/                 esquema de Drizzle y conexión
  lib/
    costing.ts        cálculo de costos, unidades, merma y subrecetas
    data.ts           carga de datos del usuario
scripts/dev.ts        arranque local con PGlite
drizzle/              migraciones SQL
```
