import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeCosts, costTone, wouldCreateCycle, type ItemInput } from './costing.ts'

const products = [
  { id: 'harina', packageQty: 1, unit: 'kg' as const, price: 32 },
  { id: 'fresa', packageQty: 1, unit: 'kg' as const, price: 60 },
  { id: 'huevo', packageQty: 30, unit: 'pz' as const, price: 95 },
  { id: 'leche', packageQty: 1, unit: 'l' as const, price: 27 }
]

const item = (partial: Partial<ItemInput> & Pick<ItemInput, 'id' | 'recipeId'>): ItemInput => ({
  productId: null, subrecipeId: null, quantity: 0, unit: null, wastePct: 0, ...partial
})

test('convierte unidades y prorratea el precio', () => {
  const costs = computeCosts(
    [{ id: 'pastel', yieldQty: 12 }],
    [
      item({ id: 'a', recipeId: 'pastel', productId: 'harina', quantity: 500, unit: 'g' }),
      item({ id: 'b', recipeId: 'pastel', productId: 'huevo', quantity: 4, unit: 'pz' }),
      item({ id: 'c', recipeId: 'pastel', productId: 'leche', quantity: 250, unit: 'ml' })
    ],
    products
  )
  const pastel = costs.get('pastel')
  assert.ok(pastel)
  assert.equal(pastel.items[0].cost.toFixed(2), '16.00')
  assert.equal(pastel.items[1].cost.toFixed(2), '12.67')
  assert.equal(pastel.items[2].cost.toFixed(2), '6.75')
  assert.equal(pastel.perYield.toFixed(4), (pastel.total / 12).toFixed(4))
})

test('la merma encarece el ingrediente', () => {
  const costs = computeCosts(
    [{ id: 'r', yieldQty: 1 }],
    [item({ id: 'a', recipeId: 'r', productId: 'fresa', quantity: 250, unit: 'g', wastePct: 15 })],
    products
  )
  assert.equal(costs.get('r')?.total.toFixed(2), '17.65')
})

test('unidades incompatibles se marcan y no suman', () => {
  const costs = computeCosts(
    [{ id: 'r', yieldQty: 1 }],
    [item({ id: 'a', recipeId: 'r', productId: 'harina', quantity: 2, unit: 'pz' })],
    products
  )
  assert.equal(costs.get('r')?.items[0].issue, 'units')
  assert.equal(costs.get('r')?.total, 0)
})

test('subrecetas usan su costo por unidad de rendimiento', () => {
  const costs = computeCosts(
    [{ id: 'ganache', yieldQty: 2 }, { id: 'pastel', yieldQty: 1 }],
    [
      item({ id: 'a', recipeId: 'ganache', productId: 'leche', quantity: 1, unit: 'l' }),
      item({ id: 'b', recipeId: 'pastel', subrecipeId: 'ganache', quantity: 1 })
    ],
    products
  )
  assert.equal(costs.get('pastel')?.total, 13.5)
})

test('detecta ciclos entre subrecetas', () => {
  const items = [item({ id: 'a', recipeId: 'x', subrecipeId: 'y', quantity: 1 })]
  assert.equal(wouldCreateCycle('y', 'x', items), true)
  assert.equal(wouldCreateCycle('x', 'z', items), false)
  assert.equal(wouldCreateCycle('x', 'x', items), true)
})

test('semáforo de costo', () => {
  assert.equal(costTone(0.25), 'good')
  assert.equal(costTone(0.34), 'warn')
  assert.equal(costTone(0.4), 'bad')
})
