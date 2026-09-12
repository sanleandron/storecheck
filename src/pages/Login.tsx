import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { signIn, signUp, signInLocal, resetPassword } from '../lib/auth';
import { isDbAvailable } from '../db/supabase';

export function Login() {
  const navigate = useNavigate();
  const configured = isDbAvailable();

  // Modo online (Supabase): email/contraseña + registro
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Modo recuperación de contraseña
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleReset = async () => {
    if (!resetEmail.trim()) {
      setError('Ingresa tu email');
      return;
    }
    setLoading(true);
    setError('');
    setResetMsg('');
    const r = await resetPassword(resetEmail.trim());
    if (r.error) {
      setError(r.error);
      setLoading(false);
      return;
    }
    setResetMsg('Te enviamos un correo. Revisa tu bandeja y pulsa el enlace para crear una nueva contraseña.');
    setLoading(false);
  };

  const handleOnlineSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    setLoading(true);
    setError('');
    const result =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, name.trim(), 'auditor');
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    navigate('/auditorias');
  };

  const handleLocalSubmit = () => {
    if (!name.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    const role = (mode === 'admin' ? 'admin' : 'auditor');
    void signInLocal(name.trim(), role);
    navigate('/auditorias');
  };

  const switchMode = (m: 'login' | 'register' | 'admin') => {
    setMode(m);
    setError('');
  };

  return (
    <div className="app-shell">
      <AppHeader title="StoreCheck HD" />
      <div className="content">
        {configured ? (
          <>
            {showReset ? (
              <Card title="Recuperar contraseña">
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="input-control"
                    placeholder="tu@correo.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                {error && <div className="error-text">{error}</div>}
                {resetMsg && (
                  <div style={{ fontSize: 13, color: 'var(--success)', marginBottom: 10 }}>{resetMsg}</div>
                )}
                <button className="btn-primary" onClick={handleReset} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar correo'}
                </button>
              </Card>
            ) : (
              <>
                <Card title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}>
                  {mode === 'register' && (
                    <div className="input-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      className="input-control"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="input-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <div className="error-text">{error}</div>}
                  <button className="btn-primary" onClick={handleOnlineSubmit} disabled={loading}>
                    {loading ? 'Espera...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
                  </button>
                  {mode === 'login' && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <button
                        className="btn-media"
                        style={{ margin: 0, background: 'transparent', color: 'var(--primary-mid)', boxShadow: 'none', fontWeight: 500 }}
                        onClick={() => {
                          setShowReset(true);
                          setError('');
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </Card>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  {mode === 'login' ? (
                    <button className="btn-secondary" style={{ margin: 0 }} onClick={() => switchMode('register')}>
                      ¿No tienes cuenta? Regístrate
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ margin: 0 }} onClick={() => switchMode('login')}>
                      Ya tengo cuenta
                    </button>
                  )}
                </div>
              </>
            )}
            {(showReset || false) && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button
                  className="btn-media"
                  style={{ margin: 0, background: 'transparent', color: 'var(--grey-dark)', boxShadow: 'none' }}
                  onClick={() => {
                    setShowReset(false);
                    setError('');
                    setResetMsg('');
                  }}
                >
                  Volver a iniciar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Card title="Iniciar sesión (modo local)">
              <div className="input-group">
                <label>Nombre</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Rol</label>
                <div className="options-grid">
                  <div className="option-pill">
                    <input
                      type="radio"
                      id="role-auditor"
                      checked={mode !== 'admin'}
                      onChange={() => switchMode('login')}
                    />
                    <label htmlFor="role-auditor">Auditor</label>
                  </div>
                  <div className="option-pill">
                    <input
                      type="radio"
                      id="role-admin"
                      checked={mode === 'admin'}
                      onChange={() => switchMode('admin')}
                    />
                    <label htmlFor="role-admin">Administrador</label>
                  </div>
                </div>
              </div>
              {error && <div className="error-text">{error}</div>}
              <button className="btn-primary" onClick={handleLocalSubmit} disabled={!name.trim()}>
                Entrar
              </button>
            </Card>
            <div style={{ fontSize: 11, color: 'var(--grey-dark)', marginTop: 10 }}>
              Supabase no configurado: modo local con datos solo en este dispositivo.
            </div>
          </>
        )}
      </div>
    </div>
  );
}