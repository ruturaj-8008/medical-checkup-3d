import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

/** Renders the initial password sign-in form. */
export function SignInForm() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ identifier, password });
      setPassword('');
    } catch {
      setError('Unable to sign in with those details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <LockKeyhole className="auth-icon" aria-hidden="true" />
        <p className="auth-eyebrow">SECURE MEDICAL CONSOLE</p>
        <h1>Sign in to Aura-3D</h1>
        <p className="auth-intro">Enter your account details to begin secure verification.</p>
        <label htmlFor="identifier">Email or username</label>
        <input id="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required disabled={isSubmitting} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={isSubmitting} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={isSubmitting || !identifier || !password}>
          {isSubmitting ? 'Verifying…' : 'Continue securely'}
        </button>
      </form>
    </main>
  );
}
