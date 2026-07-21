import { useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectAuthPermissions } from './authSlice';
import { hasPermission } from './permissions';

/**
 * Returns a `can(permission)` checker bound to the current user's claims.
 * Use for gating action buttons/menu items.
 */
export function useCan(): (permission: string) => boolean {
  const permissions = useAppSelector(selectAuthPermissions);
  return useCallback(
    (permission: string) => hasPermission(permissions, permission),
    [permissions],
  );
}
