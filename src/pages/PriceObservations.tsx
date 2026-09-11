import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { db } from '../db/dexie';
import { createEmptyPriceObservation, normalizePrice } from '../lib/pricing';
import type { PriceObservation } from '../types';

const CATEGORIES = ['Lácteos', 'Bebidas', 'Snacks', 'Cuidado personal', 'Limpieza', 'Despensa', 'Otro'];
const UNITS = ['unidad', 'kg', 'g', 'l', 'ml'];

export function PriceObservations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audit = useLiveQuery(() => (id ? db.audits.get(id) : undefined), [id]);
  const [editing, setEditing] = useState<PriceObservation | null>(null);

  if (!audit) {
    return (
      <div className="app-shell">
        <AppHeader title="Precios" showBack />
        <div className="content"><div className="empty-state"><p>Cargando...</p></div></div>
      </div>
    );
  }

  const observations = audit.priceObservations ?? [];

  const saveObservation = () => {
    if (!editing) return;
    const normalizedPrice = normalizePrice(editing.price, editing.unit);
    const next = observations.some((o) => o.id === editing.id)
      ? observations.map((o) => (o.id === editing.id ? { ...editing, normalizedPrice } : o))
      : [...observations, { ...editing, normalizedPrice }];
    db.audits.update(audit.id, {
      priceObservations: next,
      updatedAt: new Date().toISOString(),
    });
    setEditing(null);
  };

  const removeObservation = (obsId: string) => {
    db.audits.update(audit.id, {
      priceObservations: observations.filter((o) => o.id !== obsId),
      updatedAt: new Date().toISOString(),
    });
  };

  const setField = (key: keyof PriceObservation, value: string | number | boolean) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  };

  return (
    <div className="app-shell">
      <AppHeader title="Comparativa de Precios" showBack />
      <div className="content">
        <div className="progress-text">
          {observations.length} de 3 observaciones mínimas
        </div>

        {observations.map((o) => (
          <div className="price-row" key={o.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{o.product || 'Sin producto'}</div>
              <button
                className="btn-media"
                style={{ margin: 0, padding: '4px 8px', background: 'var(--danger)' }}
                onClick={() => removeObservation(o.id)}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey-dark)' }}>
              {o.brand} · {o.presentation} · {o.category}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-mid)', marginTop: 4 }}>
              {o.currency} {o.price.toLocaleString()} / {o.unit}
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-dark)' }}>
              Normalizado: {o.normalizedPrice.toFixed(2)} / {o.unit}
              {o.isPrivateLabel && ' · Marca propia'}
            </div>
          </div>
        ))}

        {editing ? (
          <Card title="Nueva observación">
            <div className="input-group">
              <label>Producto</label>
              <input
                type="text"
                className="input-control"
                value={editing.product}
                onChange={(e) => setField('product', e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="input-group">
                <label>Categoría</label>
                <select className="input-control" value={editing.category} onChange={(e) => setField('category', e.target.value)}>
                  <option value="">Seleccionar</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Marca</label>
                <input type="text" className="input-control" value={editing.brand} onChange={(e) => setField('brand', e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Presentación</label>
              <input type="text" className="input-control" placeholder="Ej. 1 kg, 500 ml, 6 unidades" value={editing.presentation} onChange={(e) => setField('presentation', e.target.value)} />
            </div>
            <div className="field-row">
              <div className="input-group">
                <label>Precio</label>
                <input type="number" className="input-control" value={editing.price} onChange={(e) => setField('price', Number(e.target.value))} />
              </div>
              <div className="input-group">
                <label>Moneda</label>
                <select className="input-control" value={editing.currency} onChange={(e) => setField('currency', e.target.value)}>
                  {['COP', 'MXN', 'USD', 'ARS', 'PEN'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Unidad</label>
                <select className="input-control" value={editing.unit} onChange={(e) => setField('unit', e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  checked={editing.isPrivateLabel}
                  onChange={(e) => setField('isPrivateLabel', e.target.checked)}
                />{' '}
                Es marca propia
              </label>
            </div>
            <div className="field-row">
              <button className="btn-secondary" style={{ margin: 0 }} onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn-primary" style={{ margin: 0 }} onClick={saveObservation}>
                Guardar
              </button>
            </div>
          </Card>
        ) : (
          <button className="btn-primary" onClick={() => setEditing(createEmptyPriceObservation())}>
            + Agregar producto
          </button>
        )}

        <div style={{ height: 20 }} />
        <button className="btn-secondary" onClick={() => navigate(`/auditorias/${audit.id}`)}>
          Volver a módulos
        </button>
      </div>
    </div>
  );
}
