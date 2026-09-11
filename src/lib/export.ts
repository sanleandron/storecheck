import { CHECKLIST_VERSION } from '../data/checklist';
import type { Audit } from '../types';

function escapeCsv(value: string | number | undefined | null): string {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function auditsToCsv(audits: Audit[]): string {
  const headers = [
    'id',
    'evaluador',
    'fechaHora',
    'cadena',
    'tienda',
    'ciudad',
    'pais',
    'moneda',
    'nse',
    'estado',
    'progreso',
    'lat',
    'lng',
  ];

  const rows = audits.map((a) => [
    a.id,
    a.evaluador,
    a.fechaHora,
    a.cadena,
    a.tienda,
    a.ciudad,
    a.pais,
    a.moneda,
    a.nse,
    a.status,
    Math.round((a.answers.length / totalQuestions()) * 100),
    a.lat ?? '',
    a.lng ?? '',
  ]);

  return [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
}

function totalQuestions(): number {
  return CHECKLIST_VERSION.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0,
  );
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
