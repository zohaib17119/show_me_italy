export interface AdminRoleRecord {
  id?: string;
  roleId?: string;
  name?: string;
  isHighestRole?: boolean;
  isDefault?: boolean;
  [key: string]: unknown;
}

export interface CreateAdminRolePayload {
  name: string;
  isHighestRole: boolean;
  isDefault: boolean;
}

export interface AssignAdminRoleClaimsPayload {
  roleId: string;
  permissions: string[];
}

export interface AdminUserRoleRecord {
  userId?: string;
  roleId?: string;
  [key: string]: unknown;
}

export interface AdminRoleClaimRecord {
  id?: number;
  roleId?: string;
  claimType?: string;
  claimValue?: string;
  [key: string]: unknown;
}
