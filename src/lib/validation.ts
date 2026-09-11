import { CHECKLIST_VERSION } from '../data/checklist';
import type { Audit, AuditAnswer } from '../types';

export function isAnswerFilled(answer: AuditAnswer | undefined): boolean {
  if (!answer) return false;
  const v = answer.value;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function sectionProgress(
  sectionId: string,
  answers: AuditAnswer[],
): number {
  const section = CHECKLIST_VERSION.sections.find((s) => s.id === sectionId);
  if (!section || section.questions.length === 0) return 0;
  const required = section.questions.filter((q) => q.required);
  if (required.length === 0) return 0;
  const filled = required.filter((q) =>
    isAnswerFilled(answers.find((a) => a.questionId === q.id)),
  ).length;
  return filled / required.length;
}

export function overallProgress(answers: AuditAnswer[]): number {
  const sections = CHECKLIST_VERSION.sections.filter((s) => s.code !== 'FT');
  if (sections.length === 0) return 0;
  const total = sections.reduce((sum, s) => sum + sectionProgress(s.id, answers), 0);
  return total / sections.length;
}

export function missingRequired(
  sectionId: string,
  answers: AuditAnswer[],
): string[] {
  const section = CHECKLIST_VERSION.sections.find((s) => s.id === sectionId);
  if (!section) return [];
  return section.questions
    .filter((q) => q.required && !isAnswerFilled(answers.find((a) => a.questionId === q.id)))
    .map((q) => q.code);
}

export function isSectionComplete(
  sectionId: string,
  answers: AuditAnswer[],
): boolean {
  return missingRequired(sectionId, answers).length === 0;
}

export function auditCompleteness(audit: Audit): number {
  return overallProgress(audit.answers);
}
