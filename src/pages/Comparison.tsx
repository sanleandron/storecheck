import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { db } from '../db/dexie';
import { auditsToCsv, downloadCsv } from '../lib/export';
import { isDbAvailable, supabase } from '../db/supabase';
import type { Audit, AuditStatus } from '../types';

function mapRowToAudit(r: Record<string, unknown>): Audit {
  return {
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
  };
}

export function Comparison() {
  const navigate = useNavigate();
  const audits = useLiveQuery(() => db.audits.orderBy('updatedAt').reverse().toArray(), []);
  const [remoteAudits, setRemoteAudits] = useState<Audit[]>([]);

  useEffect(() => {
    if (!isDbAvailable()) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase().from('audits').select('*');
      if (!cancelled && data) {
        setRemoteAudits((data as Record<string, unknown>[]).map(mapRowToAudit));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedMap = new Map<string, Audit>();
  for (const a of audits ?? []) mergedMap.set(a.id, a);
  for (const a of remoteAudits) mergedMap.set(a.id, a);
  const merged = Array.from(mergedMap.values());

  const valid = merged.filter((a) => a.status === 'validada' || a.status === 'en_revision');

  const handleExport = () => {
    if (!merged) return;
    downloadCsv('storecheck-auditorias.csv', auditsToCsv(merged));
  };

  return (
    <div className="app-shell">
      <AppHeader title="Comparación y Exportación" showBack />
      <div className="content">
        <Card title="Comparativa de precios">
          {valid.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--grey-dark)' }}>
              No hay auditorías validadas para comparar.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--grey-dark)' }}>
                  <th style={{ padding: 6 }}>Tienda</th>
                  <th style={{ padding: 6 }}>Cadena</th>
                  <th style={{ padding: 6 }}>Productos</th>
                  <th style={{ padding: 6 }}>Precio prom.</th>
                </tr>
              </thead>
              <tbody>
                {valid.map((a) => {
                  const obs = a.priceObservations ?? [];
                  const avg = obs.length
                    ? obs.reduce((s, o) => s + o.price, 0) / obs.length
                    : 0;
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 6 }}>{a.tienda}</td>
                      <td style={{ padding: 6 }}>{a.cadena}</td>
                      <td style={{ padding: 6 }}>{obs.length}</td>
                      <td style={{ padding: 6 }}>{avg ? `${a.moneda} ${avg.toFixed(0)}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Exportación">
          <p style={{ fontSize: 12, color: 'var(--grey-dark)', marginBottom: 10 }}>
            Descarga todas las auditorías en formato CSV para análisis en Excel.
          </p>
          <button className="btn-primary" onClick={handleExport}>
            ⬇ Exportar CSV
          </button>
        </Card>

        <button className="btn-secondary" onClick={() => navigate('/auditorias')}>
          Volver
        </button>
      </div>
    </div>
  );
}
