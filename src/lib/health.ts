import { isSupabaseConfigured } from '../env';
import { supabase } from '../db/supabase';

/**
 * Verificación de la conexión a Supabase desde la app.
 * Útil para validar credenciales y esquema en cuanto se configuren.
 */
export async function checkSupabaseHealth(): Promise<{ ok: boolean; detail: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      detail:
        'Supabase no configurado: completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env y reconstruye.',
    };
  }
  const sup = supabase();
  try {
    const r = await sup.from('currencies').select('code').limit(1);
    if (r.error) {
      const code = (r.error as { code?: string }).code;
      if (code === '42P01') {
        return {
          ok: false,
          detail:
            'Credenciales válidas pero faltan TABLAS: ejecuta supabase/schema.sql en el SQL Editor del proyecto.',
        };
      }
      return { ok: false, detail: `Error de lectura: ${r.error.message}` };
    }
    return { ok: true, detail: 'Conexión OK: credenciales válidas y esquema accesible.' };
  } catch (e) {
    return { ok: false, detail: `Excepción de red: ${String(e)}` };
  }
}