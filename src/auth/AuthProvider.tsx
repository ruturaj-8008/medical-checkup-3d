import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authClient from './authClient';
import type { AuthResponse, AuthState, ChallengeRequest, EnrollmentConfirmation, LoginRequest } from './types';
import './auth.css';

interface AuthContextValue {
  state: AuthState;
  login: (payload: LoginRequest) => Promise<void>;
  beginEnrollment: () => Promise<authClient.EnrollmentSetup>;
  confirmEnrollment: (payload: EnrollmentConfirmation) => Promise<string[] | undefined>;
  verifyChallenge: (payload: ChallengeRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function responseToState(response: AuthResponse): AuthState {
  return response.status === 'authenticated'
    ? { status: 'authenticated', user: response.user }
    : { status: response.status };
}

/** Provides transient authentication state derived from credentialed API calls. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void authClient.getSession()
      .then((user) => active && setState(user ? { status: 'authenticated', user } : { status: 'anonymous' }))
      .catch(() => active && setState({ status: 'anonymous' }));

    return () => { active = false; };
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authClient.login(payload);
    setState(responseToState(response));
  }, []);

  const beginEnrollment = useCallback(() => authClient.startEnrollment(), []);

  const confirmEnrollment = useCallback(async (payload: EnrollmentConfirmation) => {
    const response = await authClient.confirmEnrollment(payload);
    setState({ status: 'authenticated', user: response.user });
    return response.recoveryCodes;
  }, []);

  const verifyChallenge = useCallback(async (payload: ChallengeRequest) => {
    const response = await authClient.verifyChallenge(payload);
    setState({ status: 'authenticated', user: response.user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      setState({ status: 'anonymous' });
    }
  }, []);

  const value = useMemo(
    () => ({ state, login, beginEnrollment, confirmEnrollment, verifyChallenge, logout }),
    [beginEnrollment, confirmEnrollment, login, logout, state, verifyChallenge],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Returns the application authentication context. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
