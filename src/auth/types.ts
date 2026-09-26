export interface SessionUser {
  id: string;
  email: string;
  displayName?: string;
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'enrollment_required' }
  | { status: 'totp_required' }
  | { status: 'authenticated'; user: SessionUser };

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface EnrollmentSetup {
  otpauthUri: string;
  manualEntryKey?: string;
}

export interface EnrollmentConfirmation {
  code: string;
}

export interface ChallengeRequest {
  code: string;
  method: 'totp' | 'recovery_code';
}

export interface AuthenticatedResponse {
  status: 'authenticated';
  user: SessionUser;
  recoveryCodes?: string[];
}

export interface PendingResponse {
  status: 'enrollment_required' | 'totp_required';
}

export type AuthResponse = AuthenticatedResponse | PendingResponse;
