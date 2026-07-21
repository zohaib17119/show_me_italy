import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getApiErrorMessage } from '@/api/axiosInstance';
import {
  AppButton,
  AppCard,
  DataTable,
  FormInput,
  LoadingOverlay,
  ToggleSwitch,
  showToast,
} from '@/components/ui';
import { PERMISSION_GROUPS } from '@/features/auth/permissionsCatalog';
import {
  adminRoleApi,
  type AdminRoleRow,
} from '@/features/system/adminRoleApi';
import styles from '../settings.module.css';

export function RolesPermissionsPanel() {
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [isHighestRole, setIsHighestRole] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<AdminRoleRow | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [savingClaims, setSavingClaims] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleRow | null>(null);
  const [deletingRole, setDeletingRole] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminRoleApi.getRoles();
      setRoles(list);
    } catch (err) {
      setRoles([]);
      showToast(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const resetCreateForm = () => {
    setRoleName('');
    setIsHighestRole(false);
    setIsDefault(false);
  };

  const closeCreateModal = () => {
    if (savingRole) return;
    setCreateOpen(false);
    resetCreateForm();
  };

  const handleCreateRole = async () => {
    const name = roleName.trim();
    if (!name) {
      showToast('Role name is required');
      return;
    }
    setSavingRole(true);
    try {
      await adminRoleApi.createRole({
        name,
        isHighestRole,
        isDefault,
      });
      showToast('✓ Role created');
      setCreateOpen(false);
      resetCreateForm();
      await loadRoles();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setSavingRole(false);
    }
  };

  const openPermissions = async (role: AdminRoleRow) => {
    setActiveRole(role);
    setSelectedKeys(new Set());
    setPermissionsOpen(true);
    setLoadingClaims(true);
    try {
      const keys = await adminRoleApi.getRolePermissionKeys(role.id);
      setSelectedKeys(new Set(keys));
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load role permissions',
      );
    } finally {
      setLoadingClaims(false);
    }
  };

  const closePermissions = () => {
    if (savingClaims) return;
    setPermissionsOpen(false);
    setActiveRole(null);
    setSelectedKeys(new Set());
  };

  const togglePermission = (key: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const setModuleAll = (keys: string[], checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const key of keys) {
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!activeRole) return;
    setSavingClaims(true);
    try {
      await adminRoleApi.assignPermissions({
        roleId: activeRole.id,
        permissions: Array.from(selectedKeys),
      });
      showToast(`✓ Permissions saved for ${activeRole.name}`);
      setPermissionsOpen(false);
      setActiveRole(null);
      setSelectedKeys(new Set());
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSavingClaims(false);
    }
  };

  const closeDeleteModal = () => {
    if (deletingRole) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deletingRole) return;
    setDeletingRole(true);
    try {
      await adminRoleApi.deleteRole(deleteTarget.id);
      showToast('Role deleted successfully');
      setDeleteTarget(null);
      await loadRoles();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setDeletingRole(false);
    }
  };

  const columns: ColumnsType<AdminRoleRow> = useMemo(
    () => [
      {
        title: 'Role',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => <strong>{name}</strong>,
      },
      {
        title: 'Highest',
        key: 'isHighestRole',
        width: 100,
        render: (_, row) =>
          row.isHighestRole ? (
            <span className={styles.flagPill}>Yes</span>
          ) : (
            <span className={`${styles.flagPill} ${styles.flagPillMuted}`}>No</span>
          ),
      },
      {
        title: 'Default',
        key: 'isDefault',
        width: 100,
        render: (_, row) =>
          row.isDefault ? (
            <span className={styles.flagPill}>Yes</span>
          ) : (
            <span className={`${styles.flagPill} ${styles.flagPillMuted}`}>No</span>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 240,
        render: (_, row) => (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <AppButton
              variant="secondary"
              size="xs"
              onClick={() => void openPermissions(row)}
            >
              Edit Permissions
            </AppButton>
            <AppButton
              variant="warn"
              size="xs"
              onClick={() => setDeleteTarget(row)}
            >
              Delete Role
            </AppButton>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.panel}>
      <LoadingOverlay visible={loading} />
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Roles & Permissions</h2>
          <p className={styles.panelSub}>
            Create roles and assign screen / action permissions
          </p>
        </div>
        <AppButton onClick={() => setCreateOpen(true)}>+ Create Role</AppButton>
      </div>

      <AppCard>
        <DataTable<AdminRoleRow>
          rowKey="id"
          columns={columns}
          dataSource={roles}
          pagination={false}
          locale={{ emptyText: 'No roles yet. Create one to get started.' }}
        />
      </AppCard>

      <Modal
        title="Create Role"
        open={createOpen}
        onCancel={closeCreateModal}
        maskClosable={!savingRole}
        closable={!savingRole}
        footer={[
          <AppButton
            key="cancel"
            variant="secondary"
            onClick={closeCreateModal}
            disabled={savingRole}
          >
            Cancel
          </AppButton>,
          <AppButton
            key="save"
            onClick={() => void handleCreateRole()}
            disabled={savingRole}
          >
            {savingRole ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spin size="small" />
                Saving…
              </span>
            ) : (
              'Create'
            )}
          </AppButton>,
        ]}
        destroyOnClose
      >
        <FormInput
          label="Role name"
          value={roleName}
          disabled={savingRole}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="e.g. Operations Manager"
        />
        <div className={styles.toggleField}>
          <div>
            <div className={styles.toggleFieldLabel}>Highest role</div>
            <div className={styles.toggleFieldHint}>Full elevated access flag</div>
          </div>
          <ToggleSwitch
            checked={isHighestRole}
            disabled={savingRole}
            onCheckedChange={setIsHighestRole}
            aria-label="Highest role"
          />
        </div>
        <div className={styles.toggleField}>
          <div>
            <div className={styles.toggleFieldLabel}>Default role</div>
            <div className={styles.toggleFieldHint}>Assigned by default to new admins</div>
          </div>
          <ToggleSwitch
            checked={isDefault}
            disabled={savingRole}
            onCheckedChange={setIsDefault}
            aria-label="Default role"
          />
        </div>
      </Modal>

      <Modal
        title={
          activeRole
            ? `Edit Permissions — ${activeRole.name}`
            : 'Edit Permissions'
        }
        open={permissionsOpen}
        onCancel={closePermissions}
        width={720}
        maskClosable={!savingClaims}
        closable={!savingClaims}
        footer={[
          <AppButton
            key="cancel"
            variant="secondary"
            onClick={closePermissions}
            disabled={savingClaims || loadingClaims}
          >
            Cancel
          </AppButton>,
          <AppButton
            key="save"
            onClick={() => void handleSavePermissions()}
            disabled={savingClaims || loadingClaims}
          >
            {savingClaims ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spin size="small" />
                Saving…
              </span>
            ) : (
              `Save (${selectedKeys.size})`
            )}
          </AppButton>,
        ]}
        destroyOnClose
      >
        <p className={styles.panelSub} style={{ marginBottom: 12 }}>
          Select the screens and actions this role can access.
        </p>
        {loadingClaims ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : (
        <div className={styles.permissionGroups}>
          {PERMISSION_GROUPS.map((group) => {
            const keys = group.permissions.map((p) => p.key);
            const selectedCount = keys.filter((k) => selectedKeys.has(k)).length;
            const allSelected = selectedCount === keys.length && keys.length > 0;

            return (
              <div key={group.module} className={styles.permissionGroup}>
                <div className={styles.permissionGroupHeader}>
                  <h3 className={styles.permissionGroupTitle}>{group.label}</h3>
                  <AppButton
                    variant="secondary"
                    size="xs"
                    disabled={savingClaims}
                    onClick={() => setModuleAll(keys, !allSelected)}
                  >
                    {allSelected ? 'Clear' : 'Select all'}
                  </AppButton>
                </div>
                <div className={styles.permissionList}>
                  {group.permissions.map((perm) => (
                    <label key={perm.key} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(perm.key)}
                        disabled={savingClaims}
                        onChange={(e) => togglePermission(perm.key, e.target.checked)}
                      />
                      <span>
                        <div>{perm.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {perm.key}
                        </div>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </Modal>

      <Modal
        title="Delete role?"
        open={deleteTarget != null}
        onCancel={closeDeleteModal}
        maskClosable={!deletingRole}
        closable={!deletingRole}
        footer={[
          <AppButton
            key="cancel"
            variant="secondary"
            onClick={closeDeleteModal}
            disabled={deletingRole}
          >
            Cancel
          </AppButton>,
          <AppButton
            key="delete"
            variant="warn"
            onClick={() => void handleConfirmDelete()}
            disabled={deletingRole}
          >
            {deletingRole ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spin size="small" />
                Deleting…
              </span>
            ) : (
              'Delete'
            )}
          </AppButton>,
        ]}
        destroyOnClose
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
