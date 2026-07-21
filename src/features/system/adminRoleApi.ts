import { axiosInstance } from '@/api/axiosInstance';
import { unwrapData } from '@/api/types';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  AdminRoleClaimRecord,
  AdminRoleRecord,
  AdminUserRoleRecord,
  AssignAdminRoleClaimsPayload,
  CreateAdminRolePayload,
} from '@/api/types/adminRole';

export interface AdminRoleRow {
  id: string;
  name: string;
  isHighestRole: boolean;
  isDefault: boolean;
}

function mapAdminRole(record: AdminRoleRecord, index: number): AdminRoleRow {
  const id = String(record.id ?? record.roleId ?? index);
  return {
    id,
    name: record.name?.trim() || 'Unnamed role',
    isHighestRole: Boolean(record.isHighestRole),
    isDefault: Boolean(record.isDefault),
  };
}

export function mapClaimValues(records: AdminRoleClaimRecord[]): string[] {
  const keys: string[] = [];
  for (const record of records) {
    const value = record.claimValue?.trim();
    if (!value) continue;
    if (record.claimType && record.claimType !== 'Permission') continue;
    if (!keys.includes(value)) keys.push(value);
  }
  return keys;
}

export const adminRoleApi = {
  getRoles: async (): Promise<AdminRoleRow[]> => {
    const { data } = await axiosInstance.get('/api/AdminRole');
    return normalizeListResponse<AdminRoleRecord>(data).map(mapAdminRole);
  },

  createRole: async (payload: CreateAdminRolePayload): Promise<void> => {
    await axiosInstance.post('/api/AdminRole', payload);
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await axiosInstance.delete(`/api/AdminRole/${encodeURIComponent(roleId)}`);
  },

  assignPermissions: async (payload: AssignAdminRoleClaimsPayload): Promise<void> => {
    await axiosInstance.post('/api/AdminRoleClaim', payload);
  },

  getUserRole: async (userId: string): Promise<AdminUserRoleRecord | null> => {
    const { data } = await axiosInstance.get(`/api/AdminUserRole/${userId}`);
    const payload = unwrapData<AdminUserRoleRecord>(data) ?? (data as AdminUserRoleRecord);
    if (!payload || typeof payload !== 'object') return null;
    return payload;
  },

  getRoleClaims: async (roleId: string): Promise<AdminRoleClaimRecord[]> => {
    const { data } = await axiosInstance.get(`/api/AdminRoleClaim/${roleId}`);
    return normalizeListResponse<AdminRoleClaimRecord>(data);
  },

  getRolePermissionKeys: async (roleId: string): Promise<string[]> => {
    const claims = await adminRoleApi.getRoleClaims(roleId);
    return mapClaimValues(claims);
  },

  fetchPermissionsForUser: async (
    userId: string,
  ): Promise<{ roleId: string | null; permissions: string[] }> => {
    if (!userId.trim()) {
      return { roleId: null, permissions: [] };
    }
    try {
      const userRole = await adminRoleApi.getUserRole(userId);
      const roleId = String(userRole?.roleId ?? '').trim();
      if (!roleId) {
        return { roleId: null, permissions: [] };
      }
      const permissions = await adminRoleApi.getRolePermissionKeys(roleId);
      return { roleId, permissions };
    } catch {
      return { roleId: null, permissions: [] };
    }
  },
};
