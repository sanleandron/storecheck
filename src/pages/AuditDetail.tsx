import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { CHECKLIST_VERSION } from '../data/checklist';
import { db } from '../db/dexie';
import { isSectionComplete, overallProgress } from '../lib/validation';
import { syncAuditWithMedia } from '../lib/sync';
import { isDbAvailable } from '../db/supabase';
import { useState } from 'react';

export function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [syncError, setSyncError] = useState('');
  const audit = useLiveQuery(() => (id ? db.audits.get(id) : undefined), [id]);

  if (!audit) {
    return (
      <div className="app-shell">
        <AppHeader title="Resumen" showBack />
        <div className="content">
          <div className="empty-state"><p>Cargando...</p></div>
        </div>
      </div>
    );
  }

  const sections = CHECKLIST_VERSION.sections.filter((s) => s.code !== 'FT');
  const progress = overallProgress(audit.answers);
  const allComplete = sections.every((s) => isSectionComplete(s.id, audit.answers));

  const handleSend = async () => {
    await db.audits.update(audit.id, {
      status: allComplete ? 'completa_pendiente' : 'borrador',
      updatedAt: new Date().toISOString(),
    });
    if (isDbAvailable()) {
      const r = await syncAuditWithMedia(audit);
      if (!r.ok) setSyncError(r.error ?? 'Error de sincronización');
    }
    navigate('/auditorias');
  };

  const handleSyncNow = async () => {
    setSyncError('');
    const r = await syncAuditWithMedia(audit);
    if (!r.ok) setSyncError(r.error ?? 'Error de sincronización');
  };

  return (
    <div className="app-shell">
      <AppHeader title="Revisión y Envío" showBack />
      <div className="content">
        <Card title="Ficha de la visita">
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div><strong>Auditor:</strong> {audit.evaluador}</div>
            <div><strong>Cadena:</strong> {audit.cadena}</div>
            <div><strong>Tienda:</strong> {audit.tienda} — {audit.ciudad}, {audit.pais}</div>
            <div><strong>Fecha:</strong> {new Date(audit.fechaHora).toLocaleString()}</div>
            {audit.lat && audit.lng && (
              <div><strong>GPS:</strong> {audit.lat.toFixed(5)}, {audit.lng.toFixed(5)}</div>
            )}
            <div><strong>NSE:</strong> {audit.nse}</div>
          </div>
        </Card>

        <Card title="Completitud">
          <div className="progress-text">
            Progreso general: {Math.round(progress * 100)}%
          </div>
          {sections.map((s) => {
            const done = isSectionComplete(s.id, audit.answers);
            return (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span>{s.icon} {s.title}</span>
                <span style={{ color: done ? 'var(--success)' : 'var(--danger)' }}>
                  {done ? '✓ Completo' : '✗ Pendiente'}
                </span>
              </div>
            );
          })}
        </Card>

        {!allComplete && (
          <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>
            La auditoría no puede enviarse hasta completar todos los módulos obligatorios.
          </div>
        )}

        {isDbAvailable() && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {syncError && (
              <div className="error-text" style={{ margin: '0 0 4px' }}>{syncError}</div>
            )}
            <span style={{ fontSize: 12, color: audit.synced ? 'var(--success)' : 'var(--accent-yellow)' }}>
              {audit.synced ? 'Sincronizada' : 'Pendiente de sincronizar'}
            </span>
            <button className="btn-secondary" style={{ margin: 0 }} onClick={handleSyncNow}>
              Sincronizar ahora
            </button>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={!allComplete}
        >
          {allComplete ? 'Enviar Auditoría' : 'Guardar como borrador'}
        </button>
      </div>
    </div>
  );
}
