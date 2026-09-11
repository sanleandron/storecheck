import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { CHECKLIST_VERSION } from '../data/checklist';
import { db } from '../db/dexie';
import { isSectionComplete, overallProgress } from '../lib/validation';

export function AuditModules() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audit = useLiveQuery(() => (id ? db.audits.get(id) : undefined), [id]);

  if (!audit) {
    return (
      <div className="app-shell">
        <AppHeader title="Módulos" showBack />
        <div className="content">
          <div className="empty-state">
            <div className="icon">⏳</div>
            <p>Cargando auditoría...</p>
          </div>
        </div>
      </div>
    );
  }

  const sections = CHECKLIST_VERSION.sections.filter((s) => s.code !== 'FT');
  const progress = overallProgress(audit.answers);

  return (
    <div className="app-shell">
      <AppHeader title="Módulos de Auditoría" showBack progress={progress * 100} />
      <div className="content">
        <div className="progress-text">
          Progreso general: {Math.round(progress * 100)}%
        </div>
        <div style={{ marginBottom: 15, fontSize: 13, color: 'var(--grey-dark)' }}>
          {audit.cadena} — {audit.ciudad} · {audit.tienda}
        </div>

        {sections.map((s) => {
          const done = isSectionComplete(s.id, audit.answers);
          return (
            <div
              className={`menu-item${done ? ' done' : ''}`}
              key={s.id}
              onClick={() => navigate(`/auditorias/${audit.id}/modulos/${s.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="icon">{s.icon}</span>
                <span>{s.order}. {s.title}</span>
              </div>
              <span className="chevron">{done ? '✓' : '❯'}</span>
            </div>
          );
        })}

        <div
          className="menu-item"
          onClick={() => navigate(`/auditorias/${audit.id}/precios`)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="icon">🏷️</span>
            <span>Comparativa de Precios</span>
          </div>
          <span className="chevron">❯</span>
        </div>

        <div
          className="menu-item"
          onClick={() => navigate(`/auditorias/${audit.id}/evidencia`)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="icon">📷</span>
            <span>Evidencia (fotos / audio)</span>
          </div>
          <span className="chevron">❯</span>
        </div>

        <div style={{ height: 20 }} />
        <button
          className="btn-secondary"
          onClick={() => navigate(`/auditorias/${audit.id}/resumen`)}
        >
          Revisar y Enviar
        </button>
      </div>
    </div>
  );
}
