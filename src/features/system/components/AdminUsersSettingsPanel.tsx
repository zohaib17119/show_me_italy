import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { mapAdminUserRecords, type AdminUserRow } from '@/api/mappers/adminUserMapper';
import {
  AppButton,
  AppCard,
  DataTable,
  GuideCell,
  ListErrorState,
  LoadingOverlay,
  LockedAction,
} from '@/components/ui';
import { useCan } from '@/features/auth/useCan';
import { agentApi } from '@/features/agent/agentApi';
import { AddAdminUserModal } from './AddAdminUserModal';
import { EditAdminUserModal } from './EditAdminUserModal';
import styles from '../settings.module.css';

export function AdminUsersSettingsPanel() {
  const can = useCan();
  const canManageAdmins = can('Settings.AdminUsers');
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserRow | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await agentApi.getAllAdmins();
      setAdmins(mapAdminUserRecords(records));
    } catch (err) {
      setAdmins([]);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const handleRefresh = () => {
    void loadAdmins();
  };

  const columns = useMemo((): ColumnsType<AdminUserRow> => {
    return [
      {
        title: 'User',
        key: 'user',
        render: (_, row) => (
          <GuideCell
            initials={row.initials}
            name={row.name}
            sub={row.email}
            profilePicture={row.profilePicture}
          />
        ),
      },
      {
        title: 'Phone',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 130,
      },
      {
        title: 'Country',
        dataIndex: 'country',
        key: 'country',
        width: 120,
      },
      {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
        width: 120,
      },
      {
        title: 'Role',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 130,
        render: (value: string) => (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--g50)',
              color: 'var(--g600)',
            }}
          >
            {value}
          </span>
        ),
      },
      {
        title: 'Verified',
        dataIndex: 'isVerifiedLabel',
        key: 'isVerifiedLabel',
        width: 90,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 90,
        render: (_, row) => (
          <LockedAction allowed={canManageAdmins}>
            <AppButton variant="secondary" size="xs" onClick={() => setEditTarget(row)}>
              Edit
            </AppButton>
          </LockedAction>
        ),
      },
    ];
  }, [canManageAdmins]);

  return (
    <div className={styles.panel}>
      <LoadingOverlay visible={loading} />
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Admin Users</h2>
          <p className={styles.panelSub}>Create and manage admin accounts</p>
        </div>
        <LockedAction allowed={canManageAdmins}>
          <AppButton variant="secondary" onClick={() => setAddOpen(true)}>
            + Add Admin User
          </AppButton>
        </LockedAction>
      </div>

      {error ? (
        <ListErrorState message={error} loading={loading} onRetry={() => void loadAdmins()} />
      ) : (
        <AppCard>
          <DataTable<AdminUserRow>
            rowKey="id"
            columns={columns}
            dataSource={admins}
            pagination={false}
            locale={{ emptyText: loading ? 'Loading…' : 'No admin users found.' }}
          />
        </AppCard>
      )}

      <AddAdminUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleRefresh}
      />
      <EditAdminUserModal
        open={editTarget != null}
        userId={editTarget?.id ?? null}
        onClose={() => setEditTarget(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
