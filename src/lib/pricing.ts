import type { PriceObservation } from '../types';

const UNIT_GRAMS: Record<string, number> = {
  g: 1,
  gr: 1,
  gramo: 1,
  kg: 1000,
  kilo: 1000,
  ml: 1,
  l: 1000,
  litro: 1000,
  unidad: 1,
  un: 1,
  u: 1,
};

/**
 * Normaliza el precio a una unidad base comparable.
 * Para unidades de peso/volumen usa gramos o mililitros; para unidades usa pieza.
 */
export function normalizePrice(price: number, unit: string): number {
  if (!price || price <= 0) return 0;
  const key = unit.trim().toLowerCase();
  const factor = UNIT_GRAMS[key] ?? 1;
  return price / factor;
}

export function createEmptyPriceObservation(): PriceObservation {
  return {
    id: crypto.randomUUID(),
    product: '',
    category: '',
    brand: '',
    presentation: '',
    price: 0,
    currency: 'COP',
    unit: 'unidad',
    normalizedPrice: 0,
    isPrivateLabel: false,
  };
}
