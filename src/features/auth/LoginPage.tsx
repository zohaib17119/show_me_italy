import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppButton, AppCard, FormInput, showToast } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { loginAdmin, selectAuthError, selectAuthStatus } from './authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Email and password are required');
      return;
    }
    try {
      await dispatch(loginAdmin({ email: email.trim(), password })).unwrap();
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      showToast(getApiErrorMessage(err));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--g50)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/logo.png"
            alt="Show Me Italy"
            style={{ maxWidth: 280, width: '100%', height: 'auto' }}
          />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            Admin Sign In
          </div>
        </div>

        <AppCard>
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
              />
              <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {error && (
                <div style={{ fontSize: 12, color: 'var(--red)' }}>{error}</div>
              )}
              <AppButton type="submit" disabled={status === 'loading'} style={{ width: '100%' }}>
                {status === 'loading' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Spin size="small" /> Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </AppButton>
            </div>
          </form>
        </AppCard>
      </div>
    </div>
  );
}
