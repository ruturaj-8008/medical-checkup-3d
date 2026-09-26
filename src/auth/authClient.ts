import type {
  AuthResponse,
  ChallengeRequest,
  EnrollmentConfirmation,
  EnrollmentSetup,
  LoginRequest,
  SessionUser,
} from './types';

const apiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? '';

class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (!response.ok) {
    throw new AuthApiError('The request could not be completed. Please try again.');
  }

  return response.json() as Promise<T>;
}

/** Retrieves the minimal user profile associated with a valid full session. */
export async function getSession(): Promise<SessionUser | null> {
  const response = await fetch(`${apiBaseUrl}/auth/session`, { credentials: 'include' });
  if (response.status === 401 || response.status === 403) {
    return null;
  }
  if (!response.ok) {
    throw new AuthApiError('Unable to verify the current session.');
  }

  const body = await response.json() as { user: SessionUser };
  return body.user;
}

/** Begins password authentication without persisting credentials in the browser. */
export function login(payload: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

/** Requests a temporary, server-authorized TOTP enrollment payload. */
export function startEnrollment(): Promise<EnrollmentSetup> {
  return request<EnrollmentSetup>('/auth/totp/enrollment', { method: 'POST', body: '{}' });
}

/** Confirms enrollment and may return recovery codes exactly once. */
export function confirmEnrollment(payload: EnrollmentConfirmation): Promise<AuthenticatedResponse> {
  return request<AuthenticatedResponse>('/auth/totp/confirm', { method: 'POST', body: JSON.stringify(payload) });
}

/** Verifies a TOTP or single-use recovery code for the pending challenge. */
export function verifyChallenge(payload: ChallengeRequest): Promise<AuthenticatedResponse> {
  return request<AuthenticatedResponse>('/auth/challenge/verify', { method: 'POST', body: JSON.stringify(payload) });
}

/** Revokes the server session and clears its HTTP-only cookie. */
export async function logout(): Promise<void> {
  await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
}
