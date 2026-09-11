import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv, isSupabaseConfigured } from '../env';
import type { Audit, MediaEvidence, PriceObservation } from '../types';

export interface DbAuditRow {
  id: string;
  evaluador: string;
  fecha_hora: string;
  cadena: string;
  tienda: string;
  ciudad: string;
  pais: string;
  moneda: string;
  nse: Audit['nse'];
  lat: number | null;
  lng: number | null;
  tipo_ubicacion: string | null;
  momento_observacion: string | null;
  observaciones: string | null;
  status: Audit['status'];
  checklist_version_id: string;
  answers: Audit['answers'];
  price_observations: PriceObservation[];
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface DbMediaRow {
  id: string;
  audit_id: string;
  section_id: string | null;
  question_id: string | null;
  type: MediaEvidence['type'];
  storage_path: string | null;
  mime_type: string;
  created_at: string;
  status: MediaEvidence['status'];
}

export interface DbSyncEventRow {
  id: string;
  audit_id: string;
  kind: string; // 'audit' | 'media'
  status: 'pending' | 'uploading' | 'done' | 'failed';
  error: string | null;
  attempts: number;
  created_at: string;
}

function makeClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

let client: SupabaseClient | null = null;

/**
 * Devuelve la instancia única del cliente Supabase.
 * Lanza si no está configurado.
 */
export function supabase(): SupabaseClient {
  if (client) return client;
  client = makeClient();
  return client;
}

/** Re-inicializa el cliente (útil tras cambiar credenciales en runtime de pruebas). */
export function resetSupabaseClient(): void {
  client = null;
}

export function isDbAvailable(): boolean {
  return isSupabaseConfigured();
}