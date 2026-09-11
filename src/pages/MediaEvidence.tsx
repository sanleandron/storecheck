import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { EvidenceCapture } from '../components/EvidenceCapture';
import { CHECKLIST_VERSION } from '../data/checklist';
import { db } from '../db/dexie';

export function MediaEvidence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audit = useLiveQuery(() => (id ? db.audits.get(id) : undefined), [id]);
  const media = useLiveQuery(() => (id ? db.media.where('auditId').equals(id).toArray() : []), [id]);

  if (!audit) {
    return (
      <div className="app-shell">
        <AppHeader title="Evidencia" showBack />
        <div className="content"><div className="empty-state"><p>Cargando...</p></div></div>
      </div>
    );
  }

  const sections = CHECKLIST_VERSION.sections.filter((s) => s.code !== 'FT');

  const grouped = new Map<string, typeof media>();
  for (const m of media ?? []) {
    const key = m.sectionId ?? 'general';
    const list = grouped.get(key) ?? [];
    list.push(m);
    grouped.set(key, list);
  }

  return (
    <div className="app-shell">
      <AppHeader title="Evidencia" showBack />
      <div className="content">
        <Card title="Evidencia general">
          <EvidenceCapture auditId={audit.id} />
        </Card>

        {sections.map((s) => {
          const list = grouped.get(s.id) ?? [];
          if (list.length === 0) return null;
          return (
            <Card key={s.id} title={`${s.icon} ${s.title} (${list.length})`}>
              {list.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #eee' }}>
                  {m.type === 'photo' ? (
                    <img src={m.dataUrl} alt="evidencia" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <audio controls src={m.dataUrl} style={{ width: 150, height: 36 }} />
                  )}
                  <span style={{ fontSize: 12, color: 'var(--grey-dark)', flex: 1 }}>
                    {m.type === 'photo' ? 'Foto' : 'Audio'} · {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </Card>
          );
        })}

        {media?.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--grey-dark)', marginBottom: 10 }}>
            Aún no hay evidencia. Captura fotos o audio desde cada módulo o aquí arriba.
          </div>
        )}

        <button className="btn-secondary" onClick={() => navigate(`/auditorias/${audit.id}`)}>
          Volver a módulos
        </button>
      </div>
    </div>
  );
}
