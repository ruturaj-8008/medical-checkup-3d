import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { RequireAuth } from './auth/RequireAuth.tsx';
import './auth/auth.css';
import './index.css';
import {
  AccountPage,
  LoginPage,
  MfaChallengePage,
  RegisterPage,
  TotpSetupPage,
  VerifyEmailPage,
} from './pages/AuthPages.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<App />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/setup-authenticator" element={<TotpSetupPage />} />
          </Route>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/challenge" element={<MfaChallengePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
