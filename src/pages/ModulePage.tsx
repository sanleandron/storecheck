import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { QuestionField } from '../components/QuestionField';
import { EvidenceCapture } from '../components/EvidenceCapture';
import { CHECKLIST_VERSION } from '../data/checklist';
import { db } from '../db/dexie';
import { sectionProgress, missingRequired } from '../lib/validation';
import type { AuditAnswer } from '../types';

export function ModulePage() {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>();
  const navigate = useNavigate();
  const audit = useLiveQuery(() => (id ? db.audits.get(id) : undefined), [id]);

  if (!audit || !sectionId) {
    return (
      <div className="app-shell">
        <AppHeader title="Módulo" showBack />
        <div className="content">
          <div className="empty-state"><p>Cargando...</p></div>
        </div>
      </div>
    );
  }

  const section = CHECKLIST_VERSION.sections.find((s) => s.id === sectionId);
  if (!section) {
    return (
      <div className="app-shell">
        <AppHeader title="Módulo" showBack />
        <div className="content">
          <div className="empty-state"><p>Módulo no encontrado.</p></div>
        </div>
      </div>
    );
  }

  const progress = sectionProgress(section.id, audit.answers);

  const updateAnswer = (answer: AuditAnswer) => {
    const next = [...audit.answers.filter((a) => a.questionId !== answer.questionId), answer];
    db.audits.update(audit.id, {
      answers: next,
      updatedAt: new Date().toISOString(),
    });
  };

  const missing = missingRequired(section.id, audit.answers);

  return (
    <div className="app-shell">
      <AppHeader title={`${section.order}. ${section.title}`} showBack progress={progress * 100} />
      <div className="content">
        <div className="progress-text">
          {Math.round(progress * 100)}% del módulo completado
        </div>
        <Card>
          {section.questions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={audit.answers.find((a) => a.questionId === q.id)}
              onChange={updateAnswer}
            />
          ))}
        </Card>
        <Card title="Evidencia de esta sección">
          <EvidenceCapture auditId={audit.id} sectionId={section.id} />
        </Card>
        {missing.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>
            Campos obligatorios pendientes: {missing.join(', ')}
          </div>
        )}
        <button className="btn-primary" onClick={() => navigate(`/auditorias/${audit.id}`)}>
          Guardar y Volver
        </button>
      </div>
    </div>
  );
}
