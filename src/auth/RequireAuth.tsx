import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

// PUBLIC_INTERFACE
/** Renders nested routes only after the server-managed browser session is confirmed. */
export function RequireAuth() {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <main className="auth-shell" aria-busy="true">
        <p className="auth-loading">Checking secure session…</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
