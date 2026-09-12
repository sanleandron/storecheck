import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getSession, initSession } from './lib/auth';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { AuditList } from './pages/AuditList';
import { AuditNew } from './pages/AuditNew';
import { AuditModules } from './pages/AuditModules';
import { ModulePage } from './pages/ModulePage';
import { AuditDetail } from './pages/AuditDetail';
import { PriceObservations } from './pages/PriceObservations';
import { MediaEvidence } from './pages/MediaEvidence';
import { AdminPanel } from './pages/AdminPanel';
import { Comparison } from './pages/Comparison';

function RequireAuth({ children }: { children: JSX.Element }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

// En GitHub Pages la app vive bajo una subruta (p. ej. /storecheck/).
// Derivamos el basename del directorio base de la URL actual para que la
// navegación (BrowserRouter) funcione tanto en local como en Pages.
function detectBase(): string {
  const path = window.location.pathname;
  if (path.startsWith('/storecheck')) return '/storecheck';
  return '';
}

export default function App() {
  initSession();
  return (
    <BrowserRouter basename={detectBase()}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/actualizar-contrasena" element={<ResetPassword />} />
        <Route
          path="/auditorias"
          element={
            <RequireAuth>
              <AuditList />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/nueva"
          element={
            <RequireAuth>
              <AuditNew />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/:id"
          element={
            <RequireAuth>
              <AuditModules />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/:id/modulos/:sectionId"
          element={
            <RequireAuth>
              <ModulePage />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/:id/resumen"
          element={
            <RequireAuth>
              <AuditDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/:id/precios"
          element={
            <RequireAuth>
              <PriceObservations />
            </RequireAuth>
          }
        />
        <Route
          path="/auditorias/:id/evidencia"
          element={
            <RequireAuth>
              <MediaEvidence />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPanel />
            </RequireAuth>
          }
        />
        <Route
          path="/comparar"
          element={
            <RequireAuth>
              <Comparison />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/auditorias" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
