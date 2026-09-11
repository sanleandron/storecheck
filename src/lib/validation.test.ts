import { describe, expect, it } from 'vitest';
import { CHECKLIST_VERSION } from '../data/checklist';
import { isAnswerFilled, sectionProgress, missingRequired } from './validation';
import type { AuditAnswer } from '../types';

const m1 = CHECKLIST_VERSION.sections.find((s) => s.code === 'M1')!;

describe('isAnswerFilled', () => {
  it('retorna false para respuesta vacía', () => {
    expect(isAnswerFilled(undefined)).toBe(false);
    expect(isAnswerFilled({ questionId: 'x', value: null })).toBe(false);
    expect(isAnswerFilled({ questionId: 'x', value: '' })).toBe(false);
    expect(isAnswerFilled({ questionId: 'x', value: [] })).toBe(false);
  });

  it('retorna true para respuesta con valor', () => {
    expect(isAnswerFilled({ questionId: 'x', value: 'D1' })).toBe(true);
    expect(isAnswerFilled({ questionId: 'x', value: 5 })).toBe(true);
    expect(isAnswerFilled({ questionId: 'x', value: ['a'] })).toBe(true);
  });
});

describe('sectionProgress', () => {
  it('es 0 sin respuestas', () => {
    expect(sectionProgress(m1.id, [])).toBe(0);
  });

  it('es 1 cuando todas las obligatorias están completas', () => {
    const answers: AuditAnswer[] = m1.questions
      .filter((q) => q.required)
      .map((q) => ({ questionId: q.id, value: 'ok' }));
    expect(sectionProgress(m1.id, answers)).toBe(1);
  });
});

describe('missingRequired', () => {
  it('lista las preguntas obligatorias sin responder', () => {
    const missing = missingRequired(m1.id, []);
    expect(missing.length).toBe(m1.questions.filter((q) => q.required).length);
  });
});
