import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { setAuthDispatch } from '@/api/authBridge';
import { hydrateAuth, loadSessionPermissions } from '@/features/auth/authSlice';
import { AUTH_TOKEN_KEY } from '@/features/auth/authApi';

export function AuthBridgeInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setAuthDispatch(dispatch);
    dispatch(hydrateAuth());
    if (localStorage.getItem(AUTH_TOKEN_KEY)) {
      void dispatch(loadSessionPermissions());
    }
  }, [dispatch]);

  return null;
}
