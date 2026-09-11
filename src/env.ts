/**
 * Lectura de variables de entorno para Supabase.
 * Valores tomados de .env (VITE_*) e inyectados por Vite en tiempo de build.
 * Nunca exponer secretos: solo se usa URL pública y anon key.
 */
export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function read(): SupabaseEnv {
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
}

const cached = read();

export function isSupabaseConfigured(): boolean {
  return Boolean(cached.url && cached.anonKey);
}

export function getSupabaseEnv(): SupabaseEnv {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no está configurado. Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env',
    );
  }
  return cached;
}