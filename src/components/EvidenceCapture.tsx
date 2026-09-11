import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateId } from '../db/dexie';
import type { MediaEvidence as MediaEvidenceType } from '../types';

interface EvidenceCaptureProps {
  auditId: string;
  sectionId?: string;
  questionId?: string;
}

export function EvidenceCapture({ auditId, sectionId, questionId }: EvidenceCaptureProps) {
  const media = useLiveQuery(
    () => {
      const base = db.media.where('auditId').equals(auditId);
      return base.toArray();
    },
    [auditId],
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const sectionMedia = media?.filter(
    (m) => m.sectionId === sectionId && m.questionId === questionId,
  ) ?? [];

  const addPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const item: MediaEvidenceType = {
        id: generateId(),
        auditId,
        sectionId,
        questionId,
        type: 'photo',
        dataUrl: reader.result as string,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      await db.media.add(item);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunks.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = async () => {
        const item: MediaEvidenceType = {
          id: generateId(),
          auditId,
          sectionId,
          questionId,
          type: 'audio',
          dataUrl: reader.result as string,
          mimeType: 'audio/webm',
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        await db.media.add(item);
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    mediaRecorder.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const removeMedia = async (mediaId: string) => {
    await db.media.delete(mediaId);
  };

  return (
    <div className="evidence-capture">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addPhoto(file);
            e.target.value = '';
          }}
        />
        <button className="btn-media" onClick={() => fileInput.current?.click()}>
          📷 Tomar foto
        </button>
        {recording ? (
          <button className="btn-media" style={{ background: 'var(--danger)' }} onClick={stopRecording}>
            ⏹ Detener grabación
          </button>
        ) : (
          <button className="btn-media" onClick={startRecording}>
            🎙 Grabar nota de voz
          </button>
        )}
      </div>

      {sectionMedia.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--grey-dark)', marginBottom: 6 }}>
            Evidencia de esta sección ({sectionMedia.length})
          </div>
          {sectionMedia.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #eee' }}>
              {m.type === 'photo' ? (
                <img src={m.dataUrl} alt="evidencia" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <audio controls src={m.dataUrl} style={{ width: 150, height: 36 }} />
              )}
              <span style={{ fontSize: 12, color: 'var(--grey-dark)', flex: 1 }}>
                {m.type === 'photo' ? 'Foto' : 'Audio'} · {new Date(m.createdAt).toLocaleTimeString()}
              </span>
              <button
                className="btn-media"
                style={{ margin: 0, padding: '4px 8px', background: 'var(--danger)' }}
                onClick={() => removeMedia(m.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
