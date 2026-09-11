import { describe, expect, it } from 'vitest';
import { normalizePrice } from './pricing';

describe('normalizePrice', () => {
  it('normaliza precio por gramo a base por gramo', () => {
    expect(normalizePrice(5000, 'kg')).toBe(5);
  });

  it('normaliza precio por mililitro a base por mililitro', () => {
    expect(normalizePrice(10000, 'l')).toBe(10);
  });

  it('trata unidad desconocida como factor 1', () => {
    expect(normalizePrice(2500, 'caja')).toBe(2500);
  });

  it('retorna 0 para precio inválido', () => {
    expect(normalizePrice(0, 'kg')).toBe(0);
    expect(normalizePrice(-5, 'kg')).toBe(0);
  });
});
