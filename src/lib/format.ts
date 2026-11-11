const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const smallCurrency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 4 })
const plain = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

export function formatMoney (value: number): string {
  return currency.format(value)
}

// Para precios por gramo o mililitro, que suelen ser centavos
export function formatUnitPrice (value: number): string {
  return value < 1 ? smallCurrency.format(value) : currency.format(value)
}

export function formatNumber (value: number): string {
  return plain.format(value)
}

export function formatPercent (ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

// "porciones" → "porción", para textos como "Costo por porción"
const SINGULARS: Record<string, string> = { porciones: 'porción', piezas: 'pieza', tandas: 'tanda', litros: 'litro', unidades: 'unidad' }
export function singular (label: string): string {
  const key = label.trim().toLocaleLowerCase('es')
  if (key in SINGULARS) return SINGULARS[key]
  if (key.endsWith('es') && key.length > 4) return key.slice(0, -2)
  if (key.endsWith('s') && key.length > 3) return key.slice(0, -1)
  return key
}

export function pluralize (count: number, one: string, many: string): string {
  return `${formatNumber(count)} ${count === 1 ? one : many}`
}
