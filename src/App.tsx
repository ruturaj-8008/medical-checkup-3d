import { AuthenticatedDashboard } from './components/AuthenticatedDashboard';
import { SecondFactorChallenge } from './components/auth/SecondFactorChallenge';
import { SignInForm } from './components/auth/SignInForm';
import { TotpEnrollment } from './components/auth/TotpEnrollment';
import { useAuth } from './auth/AuthProvider';

function App() {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return (
      <main className="auth-screen" aria-busy="true">
        <section className="auth-card auth-status-card">
          <span className="auth-status-indicator" aria-hidden="true" />
          <p className="auth-eyebrow">AURA-3D ACCESS CONTROL</p>
          <h1>Verifying secure session</h1>
          <p>Please wait while your authenticated session is verified.</p>
        </section>
      </main>
    );
  }

  if (state.status === 'authenticated') {
    return <AuthenticatedDashboard user={state.user} />;
  }

  if (state.status === 'enrollment_required') {
    return <TotpEnrollment />;
  }

  if (state.status === 'totp_required') {
    return <SecondFactorChallenge />;
  }

  return <SignInForm />;
}

export default App;
