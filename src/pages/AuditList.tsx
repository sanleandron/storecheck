import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { db } from '../db/dexie';
import { getSession, signOut } from '../lib/auth';
import { auditCompleteness } from '../lib/validation';
import { syncAuditWithMedia } from '../lib/sync';
import { isDbAvailable } from '../db/supabase';
import type { AuditStatus } from '../types';

const STATUS_LABEL: Record<AuditStatus, string> = {
  borrador: 'Borrador',
  completa_pendiente: 'Pendiente de sincronizar',
  enviada: 'Enviada',
  en_revision: 'En revisión',
  validada: 'Validada',
  devuelta: 'Devuelta',
};

export function AuditList() {
  const navigate = useNavigate();
  const audits = useLiveQuery(() => db.audits.orderBy('updatedAt').reverse().toArray(), []);
  const session = getSession();
  const [syncing, setSyncing] = useState(false);

  const syncPendingNow = async () => {
    if (!isDbAvailable() || syncing) return;
    setSyncing(true);
    try {
      const pendientes = (await db.audits.toArray()).filter((a) => !a.synced);
      for (const a of pendientes) {
        await syncAuditWithMedia(a);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sincroniza las auditorías pendientes (synced: false) al montar la lista
  // y cuando cambian los datos (p. ej. al volver tras editar un módulo), siempre
  // que haya conexión.
  useEffect(() => {
    if (isDbAvailable()) void syncPendingNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audits]);

  // Al recuperar la conexión, trata de sincronizar de nuevo.
  useEffect(() => {
    const onOnline = () => void syncPendingNow();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <AppHeader title="Auditorías" />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{session?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--grey-dark)' }}>
              {session?.role === 'admin' ? 'Administrador' : 'Auditor'}
            </div>
          </div>
          <button
            className="btn-media"
            style={{ margin: 0 }}
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>

        {!audits || audits.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No hay auditorías todavía.</p>
            <p style={{ fontSize: 12 }}>Crea la primera para comenzar.</p>
          </div>
        ) : (
          audits.map((a) => {
            const pct = Math.round(auditCompleteness(a) * 100);
            return (
              <div
                className="menu-item"
                key={a.id}
                onClick={() => navigate(`/auditorias/${a.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {a.cadena} — {a.ciudad}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--grey-dark)' }}>
                    {a.tienda} · {new Date(a.fechaHora).toLocaleDateString()}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status]}</span>
                    {!a.synced && (
                      <span className="sync-indicator" style={{ marginLeft: 8 }}>
                        ⚠ sin sincronizar
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-mid)' }}>{pct}%</div>
                  <div className="progress-container" style={{ position: 'relative', width: 60, borderRadius: 4, overflow: 'hidden' }}>
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div style={{ height: 20 }} />
        <button className="btn-primary" onClick={() => navigate('/auditorias/nueva')}>
          + Nueva Auditoría
        </button>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn-secondary" style={{ margin: 0 }} onClick={() => navigate('/comparar')}>
            Comparar
          </button>
          {session?.role === 'admin' && (
            <button className="btn-secondary" style={{ margin: 0 }} onClick={() => navigate('/admin')}>
              Panel Admin
            </button>
          )}
        </div>
        {isDbAvailable() && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--grey-dark)' }}>
            {syncing
              ? 'Sincronizando...'
              : audits?.some((a) => !a.synced)
                ? `${audits.filter((a) => !a.synced).length} auditoría(s) pendiente(s)`
                : 'Todo sincronizado'}
          </div>
        )}
      </div>
    </div>
  );
}
