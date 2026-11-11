// Genera los iconos PNG de la PWA a partir del logo (tres líneas sobre verde).
// Uso: node scripts/icons.ts — escribe en public/icons/
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

// sharp viene como dependencia de Next; se resuelve desde ahí
const require = createRequire(require_resolve_next())
const sharp = require('sharp') as (input: Buffer) => { resize: (w: number, h: number) => { png: () => { toFile: (p: string) => Promise<unknown> } } }

function require_resolve_next (): string {
  return createRequire(import.meta.url).resolve('next/package.json')
}

const GREEN = '#1E5B43'

// full: fondo a sangre (maskable y Apple); si no, cuadrado redondeado
function svg (full: boolean, scale: number): string {
  const bg = full
    ? `<rect width="512" height="512" fill="${GREEN}"/>`
    : `<rect width="512" height="512" rx="112" fill="${GREEN}"/>`
  // Las líneas se escalan desde el centro para respetar la zona segura de los iconos maskable
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bg}
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)" stroke="#fff" stroke-width="40" stroke-linecap="round">
    <path d="M160 176h192M160 256h144M160 336h192"/>
  </g></svg>`
}

const out = path.join(process.cwd(), 'public', 'icons')
mkdirSync(out, { recursive: true })

const targets: Array<[string, number, boolean, number]> = [
  ['icon-192.png', 192, false, 1],
  ['icon-512.png', 512, false, 1],
  ['maskable-512.png', 512, true, 0.8],
  ['apple-touch-icon.png', 180, true, 0.85]
]

for (const [name, size, full, scale] of targets) {
  await sharp(Buffer.from(svg(full, scale))).resize(size, size).png().toFile(path.join(out, name))
  console.log('ok', name)
}
