import { describe, expect, it } from 'vitest';
import { checkSupabaseHealth } from './health';

describe('checkSupabaseHealth', () => {
  it('reporta no configuración si faltan credenciales', async () => {
    // En CI/local sin .env rellenado, isSupabaseConfigured() será false.
    const res = await checkSupabaseHealth();
    if (!import.meta.env.VITE_SUPABASE_URL) {
      expect(res.ok).toBe(false);
      expect(res.detail).toContain('Supabase no configurado');
    } else {
      // Con credenciales presentes, el resultado no debe lanzar excepción.
      expect(typeof res.ok).toBe('boolean');
      expect(typeof res.detail).toBe('string');
    }
  });
});