import { describe, expect, it } from 'vitest';
import { dataUrlToBlob } from './sync';

describe('dataUrlToBlob', () => {
  it('convierte un data URL de imagen en Blob', () => {
    const base64 = btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47));
    const dataUrl = `data:image/png;base64,${base64}`;
    const blob = dataUrlToBlob(dataUrl);
    expect(blob).not.toBeNull();
    expect(blob!.type).toBe('image/png');
    expect(blob!.size).toBeGreaterThan(0);
  });

  it('trata data URL inválido como null', () => {
    expect(dataUrlToBlob('no-es-data-url')).toBeNull();
    expect(dataUrlToBlob('')).toBeNull();
  });

  it('convierte audio webm', () => {
    const base64 = btoa('hello');
    const blob = dataUrlToBlob(`data:audio/webm;base64,${base64}`);
    expect(blob).not.toBeNull();
    expect(blob!.type).toBe('audio/webm');
  });
});