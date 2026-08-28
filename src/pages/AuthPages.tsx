import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  beginTotpEnrollment,
  confirmTotpEnrollment,
  login,
  recoverMfaChallenge,
  registerAccount,
  verifyEmail,
  verifyTotpChallenge,
  type AuthApiError,
} from '../auth/api';
import { useAuth } from '../auth/AuthProvider';

function getErrorMessage(error: unknown): string {
  const apiError = error as Partial<AuthApiError>;
  return apiError?.message ?? 'We could not complete that request. Please try again.';
}

function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-kicker">AURA-3D / SECURE ACCESS</p>
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function FormError({ message }: { message: string }) {
  return message ? (
    <p className="auth-error" role="alert">
      {message}
    </p>
  ) : null;
}

// PUBLIC_INTERFACE
/** Renders the new-account registration form. */
export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const confirmation = String(form.get('password_confirmation') ?? '');

    if (password !== confirmation) {
      setError('Passwords must match.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await registerAccount(email, password, confirmation);
      navigate('/verify-email', { state: { email } });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your secure account">
      <p className="auth-intro">Register with an email address to begin protected access.</p>
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" minLength={12} required />
        </label>
        <label>
          Confirm password
          <input name="password_confirmation" type="password" autoComplete="new-password" minLength={12} required />
        </label>
        <FormError message={error} />
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-footer">Already registered? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}

// PUBLIC_INTERFACE
/** Renders the email-verification token entry form. */
export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = (location.state as { email?: string } | null)?.email;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get('token') ?? '');
    setError('');
    setIsSubmitting(true);
    try {
      await verifyEmail(token);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Verify your email">
      <p className="auth-intro">
        {email ? `Enter the verification code sent to ${email}.` : 'Enter the verification code from your email.'}
      </p>
      <form className="auth-form" onSubmit={submit}>
        <label>
          Verification token
          <input name="token" autoComplete="one-time-code" required />
        </label>
        <FormError message={error} />
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>
      <p className="auth-footer"><Link to="/login">Return to sign in</Link></p>
    </AuthLayout>
  );
}

// PUBLIC_INTERFACE
/** Renders password sign-in and transitions to the required next authentication factor. */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticatedUser } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
      if (result.next === 'mfa_required' && result.challenge_id) {
        navigate('/challenge', { state: { challengeId: result.challenge_id } });
        return;
      }

      if (result.user) {
        setAuthenticatedUser(result.user);
        navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
        return;
      }

      setError('We could not complete that request. Please try again.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Sign in">
      <p className="auth-intro">Your dashboard opens only after secure authentication completes.</p>
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <FormError message={error} />
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Continue'}
        </button>
      </form>
      <p className="auth-footer">Need an account? <Link to="/register">Register</Link></p>
    </AuthLayout>
  );
}

// PUBLIC_INTERFACE
/** Renders the second-factor and one-time recovery-code challenge form. */
export function MfaChallengePage() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const challengeId = (useLocation().state as { challengeId?: string } | null)?.challengeId;
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!challengeId) {
    return <Navigate to="/login" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('credential') ?? '');
    setError('');
    setIsSubmitting(true);
    try {
      const result = useRecovery
        ? await recoverMfaChallenge(challengeId, value)
        : await verifyTotpChallenge(challengeId, value);
      setAuthenticatedUser(result.user);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={useRecovery ? 'Use a recovery code' : 'Confirm your authenticator'}>
      <p className="auth-intro">
        {useRecovery
          ? 'Enter one unused recovery code. It will be permanently consumed.'
          : 'Enter the current six-digit code from your authenticator app.'}
      </p>
      <form className="auth-form" onSubmit={submit}>
        <label>
          {useRecovery ? 'Recovery code' : 'Authenticator code'}
          <input
            key={useRecovery ? 'recovery' : 'totp'}
            name="credential"
            autoComplete="one-time-code"
            inputMode={useRecovery ? 'text' : 'numeric'}
            pattern={useRecovery ? undefined : '[0-9]{6}'}
            required
          />
        </label>
        <FormError message={error} />
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Checking…' : 'Complete sign in'}
        </button>
      </form>
      <button className="auth-link-button" type="button" onClick={() => setUseRecovery((value) => !value)}>
        {useRecovery ? 'Use authenticator code instead' : 'Use a recovery code instead'}
      </button>
    </AuthLayout>
  );
}

// PUBLIC_INTERFACE
/** Renders the authenticated TOTP enrollment and recovery-code acknowledgement flow. */
export function TotpSetupPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [enrollment, setEnrollment] = useState<{ enrollmentId: string; provisioningUri: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function startEnrollment() {
      try {
        const result = await beginTotpEnrollment();
        setEnrollment({ enrollmentId: result.enrollment_id, provisioningUri: result.provisioning_uri });
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    }
    void startEnrollment();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;

    setError('');
    setIsSubmitting(true);
    try {
      const result = await confirmTotpEnrollment(
        enrollment.enrollmentId,
        String(new FormData(event.currentTarget).get('code') ?? ''),
      );
      setRecoveryCodes(result.recovery_codes);
      await refreshSession();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (recoveryCodes.length > 0) {
    return (
      <AuthLayout title="Save your recovery codes">
        <p className="auth-intro">Store these codes offline now. They are displayed only once.</p>
        <ul className="recovery-codes" aria-label="One-time recovery codes">
          {recoveryCodes.map((code) => <li key={code}>{code}</li>)}
        </ul>
        <button className="auth-button" type="button" onClick={() => navigate('/account')}>
          I have saved these codes
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set up your authenticator">
      <p className="auth-intro">Scan this QR code in a standards-compatible authenticator app, then confirm its current code.</p>
      {enrollment?.provisioningUri ? (
        <img
          className="totp-qr"
          src={enrollment.provisioningUri}
          alt="Authenticator enrollment QR code"
        />
      ) : (
        <p className="auth-loading">Preparing enrollment…</p>
      )}
      <form className="auth-form" onSubmit={submit}>
        <label>
          Authenticator code
          <input name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" required />
        </label>
        <FormError message={error} />
        <button className="auth-button" disabled={!enrollment || isSubmitting} type="submit">
          {isSubmitting ? 'Confirming…' : 'Enable two-factor authentication'}
        </button>
      </form>
    </AuthLayout>
  );
}

// PUBLIC_INTERFACE
/** Renders the authenticated account overview and enrollment entry point. */
export function AccountPage() {
  const { user } = useAuth();

  return (
    <AuthLayout title="Account security">
      <dl className="account-details">
        <div><dt>Email</dt><dd>{user?.email}</dd></div>
        <div><dt>Email verification</dt><dd>{user?.email_verified ? 'Verified' : 'Pending'}</dd></div>
        <div><dt>Two-factor authentication</dt><dd>{user?.mfa_enabled ? 'Enabled' : 'Not enabled'}</dd></div>
      </dl>
      {!user?.mfa_enabled && <Link className="auth-button" to="/setup-authenticator">Set up authenticator</Link>}
      <Link className="auth-link-button" to="/">Return to dashboard</Link>
    </AuthLayout>
  );
}
