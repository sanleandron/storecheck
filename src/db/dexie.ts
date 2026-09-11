import Dexie, { type Table } from 'dexie';
import type { Audit, MediaEvidence } from '../types';

class StoreCheckDB extends Dexie {
  audits!: Table<Audit, string>;
  media!: Table<MediaEvidence, string>;

  constructor() {
    super('storecheck-db');
    this.version(1).stores({
      audits: 'id, status, cadena, ciudad, pais, createdAt, updatedAt, synced',
      media: 'id, auditId, type, status',
    });
  }
}

export const db = new StoreCheckDB();

export async function saveAudit(audit: Audit): Promise<void> {
  await db.audits.put(audit);
}

export async function getAudit(id: string): Promise<Audit | undefined> {
  return db.audits.get(id);
}

export async function listAudits(): Promise<Audit[]> {
  return db.audits.orderBy('updatedAt').reverse().toArray();
}

export async function deleteAudit(id: string): Promise<void> {
  await db.audits.delete(id);
  await db.media.where('auditId').equals(id).delete();
}

export function generateId(): string {
  return crypto.randomUUID();
}
