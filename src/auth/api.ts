export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
  mfa_enabled: boolean;
}

export interface AuthApiError {
  code: string;
  message: string;
}

export interface LoginResult {
  next: 'authenticated' | 'mfa_required';
  user?: AuthUser;
  challenge_id?: string;
}

export interface EnrollmentResult {
  enrollment_id: string;
  provisioning_uri: string;
}

const apiBaseUrl = import.meta.env.VITE_AUTH_API_URL ?? '';

/**
 * Calls the authentication API with browser-managed session cookies.
 *
 * Set VITE_AUTH_API_URL through deployment environment configuration when the
 * frontend and API are hosted on different origins.
 */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const error = body as Partial<AuthApiError> | null;
    throw {
      code: error?.code ?? 'request_failed',
      message: error?.message ?? 'We could not complete that request. Please try again.',
    } satisfies AuthApiError;
  }

  return body as T;
}

// PUBLIC_INTERFACE
/** Returns the authenticated browser-session profile. */
export function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>('/v1/auth/me');
}

// PUBLIC_INTERFACE
/** Registers an account and requests an email-verification message. */
export function registerAccount(
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  return request<void>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

// PUBLIC_INTERFACE
/** Submits a one-time email verification token. */
export function verifyEmail(token: string): Promise<void> {
  return request<void>('/v1/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// PUBLIC_INTERFACE
/** Starts password sign-in and returns its next required authentication state. */
export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// PUBLIC_INTERFACE
/** Begins authenticated TOTP enrollment. */
export function beginTotpEnrollment(): Promise<EnrollmentResult> {
  return request<EnrollmentResult>('/v1/auth/mfa/enroll', { method: 'POST' });
}

// PUBLIC_INTERFACE
/** Confirms TOTP enrollment and returns recovery codes exactly once. */
export function confirmTotpEnrollment(
  enrollmentId: string,
  code: string,
): Promise<{ recovery_codes: string[] }> {
  return request<{ recovery_codes: string[] }>('/v1/auth/mfa/enroll/confirm', {
    method: 'POST',
    body: JSON.stringify({ enrollment_id: enrollmentId, code }),
  });
}

// PUBLIC_INTERFACE
/** Completes a pending password challenge with a current TOTP code. */
export function verifyTotpChallenge(
  challengeId: string,
  code: string,
): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ challenge_id: challengeId, code }),
  });
}

// PUBLIC_INTERFACE
/** Completes a pending password challenge using one recovery code. */
export function recoverMfaChallenge(
  challengeId: string,
  recoveryCode: string,
): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/v1/auth/mfa/recover', {
    method: 'POST',
    body: JSON.stringify({ challenge_id: challengeId, recovery_code: recoveryCode }),
  });
}

// PUBLIC_INTERFACE
/** Revokes the browser session and clears its server-managed cookie. */
export function logout(): Promise<void> {
  return request<void>('/v1/auth/logout', { method: 'POST' });
}
