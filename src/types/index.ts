export type QuestionType =
  | 'text'
  | 'number'
  | 'percent'
  | 'select'
  | 'multi'
  | 'range'
  | 'evidence';

export type Source = 'observado' | 'contado' | 'estimado' | 'informado';
export type Confidence = 'alto' | 'medio' | 'bajo';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface ChecklistQuestion {
  id: string;
  code: string;
  type: QuestionType;
  label: string;
  help?: string;
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  options?: QuestionOption[];
  conditionalOn?: string;
  order: number;
}

export interface ChecklistSection {
  id: string;
  code: string;
  title: string;
  icon: string;
  order: number;
  questions: ChecklistQuestion[];
}

export interface ChecklistVersion {
  id: string;
  version: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  sections: ChecklistSection[];
}

export type AuditStatus =
  | 'borrador'
  | 'completa_pendiente'
  | 'enviada'
  | 'en_revision'
  | 'validada'
  | 'devuelta';

export interface AuditAnswer {
  questionId: string;
  value: string | number | string[] | null;
  unit?: string;
  source?: Source;
  confidence?: Confidence;
  comment?: string;
}

export interface PriceObservation {
  id: string;
  product: string;
  category: string;
  brand: string;
  presentation: string;
  price: number;
  currency: string;
  unit: string;
  normalizedPrice: number;
  isPrivateLabel: boolean;
  promoType?: string;
}

export interface Audit {
  id: string;
  evaluador: string;
  fechaHora: string;
  cadena: string;
  tienda: string;
  ciudad: string;
  pais: string;
  moneda: string;
  lat?: number;
  lng?: number;
  nse: 'alto' | 'medio' | 'popular';
  tipoUbicacion?: string;
  momentoObservacion?: string;
  observaciones?: string;
  status: AuditStatus;
  checklistVersionId: string;
  userId?: string;
  answers: AuditAnswer[];
  priceObservations: PriceObservation[];
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface MediaEvidence {
  id: string;
  auditId: string;
  sectionId?: string;
  questionId?: string;
  type: 'photo' | 'audio' | 'video';
  dataUrl: string;
  mimeType: string;
  createdAt: string;
  status: 'pending' | 'uploaded' | 'failed';
}
