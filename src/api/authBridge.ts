import type { AppDispatch } from '@/app/store';
import { logout } from '@/features/auth/authSlice';

let dispatchRef: AppDispatch | null = null;

export function setAuthDispatch(dispatch: AppDispatch) {
  dispatchRef = dispatch;
}

export function dispatchLogout() {
  dispatchRef?.(logout());
}
