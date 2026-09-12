import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { updatePassword, hasRecoveryToken } from '../lib/auth';
import { isDbAvailable } from '../db/supabase';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Espera un instante para que supabase-js procese el hash de recovery.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!hasRecoveryToken() && !isDbAvailable()) {
      setError('Enlace no válido o sesión expirada. Solicita un nuevo correo de recuperación.');
      return;
    }
    setLoading(true);
    setError('');
    const r = await updatePassword(password);
    if (r.error) {
      setError(r.error);
      setLoading(false);
      return;
    }
    setOk(true);
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <AppHeader title="Actualizar contraseña" showBack />
      <div className="content">
        {ok ? (
          <Card title="Contraseña actualizada">
            <p style={{ fontSize: 13, color: 'var(--grey-dark)', marginBottom: 12 }}>
              Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.
            </p>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Ir a iniciar sesión
            </button>
          </Card>
        ) : (
          <Card title="Nueva contraseña">
            {!hasRecoveryToken() && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>
                Este enlace no incluye token de recuperación. Vuelve a solicitar el correo desde la
                pantalla de inicio de sesión.
              </div>
            )}
            <div className="input-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!ready}
              />
            </div>
            <div className="input-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={!ready}
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading || !ready}>
              {loading ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}