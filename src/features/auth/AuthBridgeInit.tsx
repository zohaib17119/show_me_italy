import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { setAuthDispatch } from '@/api/authBridge';
import { hydrateAuth } from '@/features/auth/authSlice';

export function AuthBridgeInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setAuthDispatch(dispatch);
    dispatch(hydrateAuth());
  }, [dispatch]);

  return null;
}
