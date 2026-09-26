import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

/** Renders a challenge for a TOTP code or one unused recovery code. */
export function SecondFactorChallenge() {
  const { verifyChallenge, logout } = useAuth();
  const [method, setMethod] = useState<'totp' | 'recovery_code'>('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await verifyChallenge({ method, code });
    } catch {
      setError('That verification could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const usingTotp = method === 'totp';
  return (
    <main className="auth-screen"><form className="auth-card" onSubmit={submit}>
      <KeyRound className="auth-icon" aria-hidden="true" />
      <p className="auth-eyebrow">SECOND FACTOR REQUIRED</p><h1>Verify your identity</h1>
      <p className="auth-intro">{usingTotp ? 'Enter the current six-digit code from your authenticator app.' : 'Enter one unused recovery code from your saved set.'}</p>
      <div className="auth-toggle" role="group" aria-label="Verification method">
        <button type="button" className={usingTotp ? 'active' : ''} onClick={() => { setMethod('totp'); setCode(''); }}>Authenticator code</button>
        <button type="button" className={!usingTotp ? 'active' : ''} onClick={() => { setMethod('recovery_code'); setCode(''); }}>Recovery code</button>
      </div>
      <label htmlFor="challenge-code">{usingTotp ? 'Authenticator code' : 'Recovery code'}</label>
      <input id="challenge-code" inputMode={usingTotp ? 'numeric' : 'text'} maxLength={usingTotp ? 6 : 64} value={code} onChange={(event) => setCode(usingTotp ? event.target.value.replace(/\D/g, '') : event.target.value)} autoComplete="one-time-code" required disabled={isSubmitting} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting || !code}>{isSubmitting ? 'Verifying…' : 'Verify and continue'}</button>
      <button className="auth-secondary" type="button" onClick={() => void logout()}>Cancel and sign out</button>
    </form></main>
  );
}
