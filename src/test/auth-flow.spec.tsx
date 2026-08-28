import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { AuthProvider } from '../auth/AuthProvider';
import { RequireAuth } from '../auth/RequireAuth';

vi.mock('../components/MedicalCanvas', () => ({
  MedicalCanvas: () => <div data-testid="medical-canvas" />,
}));
vi.mock('../components/VitalsPanel', () => ({
  VitalsPanel: () => <div data-testid="vitals-panel" />,
}));
vi.mock('../components/ScanFlow', () => ({
  ScanFlow: () => <div data-testid="scan-flow" />,
}));
vi.mock('../components/DiagnosticReport', () => ({
  DiagnosticReport: () => <div data-testid="diagnostic-report" />,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const authenticatedUser = {
  id: 'user-1',
  email: 'person@example.com',
  email_verified: true,
  mfa_enabled: true,
};

function GuardedApp() {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<h1>Protected dashboard</h1>} />
            </Route>
            <Route path="/login" element={<h1>Sign in</h1>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

function DashboardWithLogoutControl() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<App />} />
          </Route>
          <Route path="/login" element={<h1>Sign in</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('authentication route guard', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.history.pushState({}, '', '/');
  });

  it('does not render the dashboard when session bootstrap is rejected', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ code: 'unauthorized', message: 'Sign in required.' }),
    });

    render(<GuardedApp />);

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Protected dashboard' })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/me',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('renders the dashboard only after a successful session bootstrap', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => authenticatedUser,
    });

    render(<GuardedApp />);

    expect(await screen.findByRole('heading', { name: 'Protected dashboard' })).toBeInTheDocument();
  });

  it('ends the authenticated session through the production sign-out control', async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => authenticatedUser,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

    render(<DashboardWithLogoutControl />);

    await user.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/v1/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('person@example.com')).not.toBeInTheDocument();
  });
});
