import { useEffect, useState, type FormEvent } from 'react';
import { Copy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

/** Guides a newly verified user through authenticator-app enrollment. */
export function TotpEnrollment() {
  const { beginEnrollment, confirmEnrollment, logout } = useAuth();
  const [setupUri, setSetupUri] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void beginEnrollment().then((setup) => setSetupUri(setup.otpauthUri)).catch(() => setError('Unable to start secure enrollment. Please sign in again.'));
  }, [beginEnrollment]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const codes = await confirmEnrollment({ code });
      setRecoveryCodes(codes ?? []);
    } catch {
      setError('That verification code could not be confirmed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recoveryCodes) {
    return (
      <main className="auth-screen"><section className="auth-card">
        <ShieldCheck className="auth-icon" aria-hidden="true" />
        <p className="auth-eyebrow">ENROLLMENT COMPLETE</p><h1>Save your recovery codes</h1>
        <p className="auth-intro">These codes are shown once. Store them offline in a secure place before continuing.</p>
        <div className="recovery-codes">{recoveryCodes.map((recoveryCode) => <code key={recoveryCode}>{recoveryCode}</code>)}</div>
        <button className="auth-submit" type="button" onClick={() => setRecoveryCodes(null)}><Copy size={16} /> I have saved my codes</button>
      </section></main>
    );
  }

  return (
    <main className="auth-screen"><form className="auth-card" onSubmit={submit}>
      <ShieldCheck className="auth-icon" aria-hidden="true" />
      <p className="auth-eyebrow">SECOND FACTOR SETUP</p><h1>Enroll your authenticator</h1>
      <p className="auth-intro">Add the setup URI to your authenticator app, then enter its six-digit verification code.</p>
      {setupUri ? <code className="setup-uri">{setupUri}</code> : <p className="auth-intro">Preparing secure enrollment…</p>}
      <label htmlFor="enrollment-code">Authenticator code</label>
      <input id="enrollment-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" required disabled={isSubmitting} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting || code.length !== 6}>{isSubmitting ? 'Confirming…' : 'Confirm authenticator'}</button>
      <button className="auth-secondary" type="button" onClick={() => void logout()}>Cancel and sign out</button>
    </form></main>
  );
}
