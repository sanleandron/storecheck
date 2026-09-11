import { supabase, isDbAvailable } from '../db/supabase';
import { db } from '../db/dexie';
import type { Audit, MediaEvidence } from '../types';

const MEDIA_BUCKET = 'evidence';

function toDbAudit(audit: Audit): Record<string, unknown> {
  return {
    id: audit.id,
    evaluador: audit.evaluador,
    fecha_hora: audit.fechaHora,
    cadena: audit.cadena,
    tienda: audit.tienda,
    ciudad: audit.ciudad,
    pais: audit.pais,
    moneda: audit.moneda,
    nse: audit.nse,
    lat: audit.lat ?? null,
    lng: audit.lng ?? null,
    tipo_ubicacion: audit.tipoUbicacion ?? null,
    momento_observacion: audit.momentoObservacion ?? null,
    observaciones: audit.observaciones ?? null,
    status: audit.status,
    checklist_version_id: audit.checklistVersionId,
    answers: audit.answers,
    price_observations: audit.priceObservations,
    user_id: audit.userId ?? null,
    created_at: audit.createdAt,
    updated_at: audit.updatedAt,
  };
}

/**
 * Registra un evento de sincronización (trazabilidad).
 * Fire-and-forget: un error de registro no bloquea el sync principal.
 */
async function recordSyncEvent(auditId: string, kind: string, status: string, error?: string) {
  try {
    await supabase()
      .from('sync_events')
      .insert({ audit_id: auditId, kind, status, error: error ?? null });
  } catch {
    // silent
  }
}

/**
 * Sube una auditoría a Supabase. Idempotente por UUID: si ya existe,
 * se actualiza (upsert) en lugar de duplicarse.
 */
export async function syncAudit(audit: Audit): Promise<{ ok: boolean; error?: string }> {
  if (!isDbAvailable()) return { ok: false, error: 'Supabase no configurado' };
  const sup = supabase();
  try {
    const { error } = await sup
      .from('audits')
      .upsert(toDbAudit(audit), { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      await recordSyncEvent(audit.id, 'audit', 'failed', error.message);
      return { ok: false, error: error.message };
    }
    await recordSyncEvent(audit.id, 'audit', 'done');
    await db.audits.update(audit.id, { synced: true, updatedAt: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await recordSyncEvent(audit.id, 'audit', 'failed', msg);
    return { ok: false, error: msg };
  }
}

/**
 * Ahora se centraliza la subida de un archivo a Storage.
 * Devuelve el storage_path si ok.
 */
async function uploadMediaFile(
  mediaId: string,
  fileName: string,
  blob: Blob,
): Promise<{ path: string; error?: string }> {
  const sup = supabase();
  try {
    const { error } = await sup.storage
      .from(MEDIA_BUCKET)
      .upload(`media/${mediaId}/${fileName}`, blob, { upsert: true });
    if (error) return { path: '', error: error.message };
    return { path: `media/${mediaId}/${fileName}` };
  } catch (e) {
    return { path: '', error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Convierte un data URL en Blob (para poder subirlo a Storage).
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [head, base64] = dataUrl.split(',');
    const mime = head.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

/**
 * Sube la evidencia pendiente de una auditoría a Supabase Storage
 * y registra el registro media_evidence con el path.
 */
export async function syncMedia(auditId: string, media: MediaEvidence[]): Promise<{ ok: boolean; errors: string[] }> {
  if (!isDbAvailable()) return { ok: false, errors: ['Supabase no configurado'] };
  const sup = supabase();
  const errors: string[] = [];
  // Asegurar bucket
  try {
    await sup.storage.createBucket(MEDIA_BUCKET, { public: true });
  } catch {
    // bucket probablemente ya existe
  }

  for (const m of media) {
    if (m.status === 'uploaded') continue;
    const blob = dataUrlToBlob(m.dataUrl);
    if (!blob) {
      db.media.update(m.id, { status: 'failed' });
      errors.push(`No se pudo leer ${m.id}`);
      continue;
    }
    const ext = m.type === 'photo' ? 'jpg' : 'webm';
    const { path, error } = await uploadMediaFile(m.id, `evidence.${ext}`, blob);
    if (error) {
      db.media.update(m.id, { status: 'failed' });
      errors.push(error);
      continue;
    }
    const { error: rowError } = await sup.from('media_evidence').upsert(
      {
        id: m.id,
        audit_id: auditId,
        section_id: m.sectionId ?? null,
        question_id: m.questionId ?? null,
        type: m.type,
        storage_path: path,
        mime_type: m.mimeType,
        created_at: m.createdAt,
        status: 'uploaded',
      },
      { onConflict: 'id', ignoreDuplicates: false },
    );
    if (rowError) {
      errors.push(rowError.message);
      continue;
    }
    await db.media.update(m.id, { status: 'uploaded' });
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Sincroniza todo: la auditoría y su evidencia pendiente.
 */
export async function syncAuditWithMedia(audit: Audit): Promise<{ ok: boolean; error?: string }> {
  const auditResult = await syncAudit(audit);
  if (!auditResult.ok) return auditResult;

  const media = await db.media.where('auditId').equals(audit.id).toArray();
  if (media.length > 0) {
    const mediaResult = await syncMedia(audit.id, media);
    if (!mediaResult.ok) {
      return { ok: false, error: mediaResult.errors.join('; ') };
    }
  }
  await recordSyncEvent(audit.id, 'media', 'done');
  return { ok: true };
}