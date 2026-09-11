import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { CHECKLIST_VERSION, CATALOGOS } from '../data/checklist';
import { db, generateId } from '../db/dexie';
import { getSession } from '../lib/auth';
import type { Audit } from '../types';

export function AuditNew() {
  const navigate = useNavigate();
  const session = getSession();
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [form, setForm] = useState({
    evaluador: session?.name ?? '',
    fechaHora: localNow,
    cadena: 'D1',
    tienda: '',
    ciudad: '',
    pais: 'Colombia',
    moneda: 'COP',
    nse: 'popular' as Audit['nse'],
    tipoUbicacion: '',
    momentoObservacion: '',
    observaciones: '',
  });
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocalización no disponible');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError('No se pudo obtener la ubicación');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCreate = async () => {
    const audit: Audit = {
      id: generateId(),
      evaluador: form.evaluador,
      fechaHora: form.fechaHora,
      cadena: form.cadena,
      tienda: form.tienda,
      ciudad: form.ciudad,
      pais: form.pais,
      moneda: form.moneda,
      lat: gps?.lat,
      lng: gps?.lng,
      nse: form.nse,
      tipoUbicacion: form.tipoUbicacion,
      momentoObservacion: form.momentoObservacion,
      observaciones: form.observaciones,
      status: 'borrador',
      checklistVersionId: CHECKLIST_VERSION.id,
      userId: session?.id,
      answers: [],
      priceObservations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    await db.audits.put(audit);
    navigate(`/auditorias/${audit.id}`);
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="app-shell">
      <AppHeader title="Nueva Auditoría" showBack />
      <div className="content">
        <Card title="Ficha Técnica">
          <div className="input-group">
            <label>Evaluador</label>
            <input
              type="text"
              className="input-control"
              value={form.evaluador}
              onChange={(e) => set('evaluador', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Fecha y Hora</label>
            <input
              type="datetime-local"
              className="input-control"
              value={form.fechaHora}
              onChange={(e) => set('fechaHora', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Cadena / Competidor</label>
            <select className="input-control" value={form.cadena} onChange={(e) => set('cadena', e.target.value)}>
              {CATALOGOS.cadenas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Tienda</label>
            <input
              type="text"
              className="input-control"
              placeholder="Nombre o código de tienda"
              value={form.tienda}
              onChange={(e) => set('tienda', e.target.value)}
            />
          </div>
          <div className="field-row">
            <div className="input-group">
              <label>Ciudad</label>
              <input
                type="text"
                className="input-control"
                placeholder="Ej. Barquisimeto"
                value={form.ciudad}
                onChange={(e) => set('ciudad', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>País</label>
              <select className="input-control" value={form.pais} onChange={(e) => set('pais', e.target.value)}>
                {CATALOGOS.paises.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="input-group">
              <label>Moneda</label>
              <select className="input-control" value={form.moneda} onChange={(e) => set('moneda', e.target.value)}>
                {CATALOGOS.monedas.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>GPS</label>
              <button
                className="gps-btn"
                onClick={captureGps}
                disabled={gpsLoading}
                style={{ width: '100%' }}
              >
                {gpsLoading ? '⏳' : gps ? '📍 ✓' : '📍 GPS'}
              </button>
            </div>
          </div>
          {gps && (
            <div style={{ fontSize: 11, color: 'var(--grey-dark)', marginBottom: 10 }}>
              {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </div>
          )}
          {gpsError && <div className="error-text">{gpsError}</div>}
          <div className="input-group">
            <label>Nivel socioeconómico de la zona</label>
            <div className="options-grid">
              {(['alto', 'medio', 'popular'] as const).map((n) => (
                <div className="option-pill" key={n}>
                  <input
                    type="radio"
                    id={`nse-${n}`}
                    checked={form.nse === n}
                    onChange={() => set('nse', n)}
                  />
                  <label htmlFor={`nse-${n}`}>{n.charAt(0).toUpperCase() + n.slice(1)}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>Tipo de ubicación</label>
            <select className="input-control" value={form.tipoUbicacion} onChange={(e) => set('tipoUbicacion', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="cc">Centro comercial</option>
              <option value="zona">Zona comercial</option>
              <option value="barrio">Barrio residencial</option>
              <option value="via">Vía principal</option>
            </select>
          </div>
          <div className="input-group">
            <label>Momento de observación</label>
            <select className="input-control" value={form.momentoObservacion} onChange={(e) => set('momentoObservacion', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="manana">Mañana</option>
              <option value="mediodia">Mediodía</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          <div className="input-group">
            <label>Observaciones generales</label>
            <textarea
              className="input-control"
              rows={3}
              value={form.observaciones}
              onChange={(e) => set('observaciones', e.target.value)}
            />
          </div>
        </Card>
        <button className="btn-primary" onClick={handleCreate}>
          Crear y comenzar checklist
        </button>
      </div>
    </div>
  );
}
