import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { db } from '../db/dexie';
import { getSession } from '../lib/auth';
import { auditCompleteness } from '../lib/validation';
import { isDbAvailable } from '../db/supabase';
import { supabase } from '../db/supabase';
import type { Audit, AuditStatus } from '../types';

const STATUS_LABEL: Record<AuditStatus, string> = {
  borrador: 'Borrador',
  completa_pendiente: 'Pendiente de sincronizar',
  enviada: 'Enviada',
  en_revision: 'En revisión',
  validada: 'Validada',
  devuelta: 'Devuelta',
};

export function AdminPanel() {
  const navigate = useNavigate();
  const audits = useLiveQuery(() => db.audits.orderBy('updatedAt').reverse().toArray(), []);
  const session = getSession();
  const [remoteAudits, setRemoteAudits] = useState<Audit[]>([]);
  const [msg, setMsg] = useState('');

  if (session?.role !== 'admin') {
    return (
      <div className="app-shell">
        <AppHeader title="Panel Admin" showBack />
        <div className="content">
          <div className="empty-state">
            <div className="icon">🔒</div>
            <p>Solo el Administrador puede acceder aquí.</p>
          </div>
        </div>
      </div>
    );
  }

  // Carga las auditorías sincronizadas por todos los usuarios (el admin, por RLS, las ve todas).
  const loadRemote = async () => {
    if (!isDbAvailable()) return;
    setMsg('Cargando...');
    const { data, error } = await supabase().from('audits').select('*');
    if (error) {
      setMsg(`Error: ${error.message}`);
      return;
    }
    const mapped: Audit[] = (data ?? []).map((r) => mapRowToAudit(r));
    setRemoteAudits(mapped);
    setMsg('');
  };

  const mapRowToAudit = (r: Record<string, unknown>): Audit => ({
    id: String(r.id),
    evaluador: String(r.evaluador),
    fechaHora: String(r.fecha_hora),
    cadena: String(r.cadena),
    tienda: String(r.tienda),
    ciudad: String(r.ciudad),
    pais: String(r.pais),
    moneda: String(r.moneda),
    nse: (r.nse as Audit['nse']) ?? 'medio',
    lat: r.lat as number | undefined,
    lng: r.lng as number | undefined,
    status: (r.status as AuditStatus) ?? 'borrador',
    checklistVersionId: String(r.checklist_version_id),
    userId: r.user_id as string | undefined,
    answers: Array.isArray(r.answers) ? r.answers : [],
    priceObservations: Array.isArray(r.price_observations) ? r.price_observations : [],
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    synced: true,
  });

  const setStatus = async (id: string, status: AuditStatus) => {
    // Local
    db.audits.update(id, { status, updatedAt: new Date().toISOString() });
    // Remoto
    if (isDbAvailable()) {
      const { error } = await supabase()
        .from('audits')
        .update({ status })
        .eq('id', id);
      if (!error) {
        setRemoteAudits((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    }
  };

  const pending = audits?.filter((a) => a.status === 'en_revision' || a.status === 'completa_pendiente') ?? [];
  // Consolida locales + remotas sin duplicar por id
  const mergedMap = new Map<string, Audit>();
  for (const a of audits ?? []) mergedMap.set(a.id, a);
  for (const a of remoteAudits) mergedMap.set(a.id, a);
  const merged = Array.from(mergedMap.values()).sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));

  return (
    <div className="app-shell">
      <AppHeader title="Panel Administrativo" showBack />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="progress-text">
            {pending.length} auditoría(s) pendientes de revisión
          </div>
          {isDbAvailable() && (
            <button className="btn-media" style={{ margin: 0 }} onClick={loadRemote}>
              Cargar remotas
            </button>
          )}
        </div>
        {isDbAvailable() && <div style={{ fontSize: 12, color: 'var(--grey-dark)', marginTop: 4 }}>{msg}</div>}

        {merged.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No hay auditorías registradas.</p>
          </div>
        ) : (
          merged.map((a) => {
            const pct = Math.round(auditCompleteness(a) * 100);
            const needsReview = a.status === 'en_revision' || a.status === 'completa_pendiente';
            return (
              <div className="card" key={a.id}>
                <div className="card-title">
                  <span>{a.cadena} — {a.ciudad}</span>
                  <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status]}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--grey-dark)', marginBottom: 8 }}>
                  {a.tienda} · {a.evaluador} · {pct}% completo
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn-media" style={{ margin: 0 }} onClick={() => navigate(`/auditorias/${a.id}`)}>
                    Ver detalle
                  </button>
                  {needsReview && (
                    <>
                      <button
                        className="btn-media"
                        style={{ margin: 0, background: 'var(--success)' }}
                        onClick={() => setStatus(a.id, 'validada')}
                      >
                        Validar
                      </button>
                      <button
                        className="btn-media"
                        style={{ margin: 0, background: 'var(--danger)' }}
                        onClick={() => setStatus(a.id, 'devuelta')}
                      >
                        Devolver
                      </button>
                    </>
                  )}
                  {a.status === 'devuelta' && (
                    <button
                      className="btn-media"
                      style={{ margin: 0 }}
                      onClick={() => setStatus(a.id, 'en_revision')}
                    >
                      Reabrir
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}