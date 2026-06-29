import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  DataTable,
  GuideCell,
  LangChip,
  ListErrorState,
  LoadingOverlay,
  showToast,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { ROUTES } from '@/constants/routes';
import {
  approveAgent,
  fetchUnverifiedAgents,
  rejectAgent,
  selectUnverifiedGuideError,
  selectUnverifiedGuideStatus,
  selectUnverifiedGuides,
} from '@/features/agent/agentSlice';
import type { Guide } from '@/mocks/guides';
import { RejectAgentModal } from './components/RejectAgentModal';

function registeredLabel(adminNote: string): string {
  const match = adminNote.match(/Registered (.+)/);
  if (match) return `Registered: ${match[1]}`;
  return adminNote || 'Awaiting review';
}

export function ApprovalsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pendingGuides = useAppSelector(selectUnverifiedGuides);
  const status = useAppSelector(selectUnverifiedGuideStatus);
  const error = useAppSelector(selectUnverifiedGuideError);

  useFetchErrorToast(status, error);

  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void dispatch(fetchUnverifiedAgents());
  }, [dispatch]);

  const refreshList = () => {
    void dispatch(fetchUnverifiedAgents());
  };

  const handleApprove = async (userId: string, name: string) => {
    setActionLoading(true);
    try {
      await dispatch(approveAgent(userId)).unwrap();
      showToast(`✓ ${name} approved!`);
      refreshList();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve guide');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await dispatch(rejectAgent({ userId: rejectTarget.id, reason })).unwrap();
      showToast(`${rejectTarget.name} rejected`);
      setRejectTarget(null);
      refreshList();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject guide');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<Guide> = useMemo(
    () => [
      {
        title: 'Guide',
        key: 'guide',
        render: (_, record) => (
          <GuideCell initials={record.initials} name={record.name} sub={record.email} />
        ),
      },
      {
        title: 'Languages',
        key: 'languages',
        render: (_, record) => (
          <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {record.languages.map((lang) => (
              <LangChip key={lang} code={lang} />
            ))}
          </span>
        ),
      },
      {
        title: 'Registered',
        key: 'registered',
        render: (_, record) => (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {registeredLabel(record.adminNote)}
          </span>
        ),
      },
      {
        title: 'License',
        key: 'license',
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12 }}>{record.license}</span>
            {record.certificateUpload ? (
              <AppButton
                variant="secondary"
                size="xs"
                onClick={() => window.open(record.certificateUpload, '_blank', 'noopener')}
              >
                View Doc
              </AppButton>
            ) : (
              <AppButton variant="secondary" size="xs" disabled>
                No Doc
              </AppButton>
            )}
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <AppButton
              variant="secondary"
              size="xs"
              onClick={() => navigate(`/guides/${record.id}`)}
            >
              View Profile
            </AppButton>
            <AppButton
              variant="danger"
              size="xs"
              disabled={actionLoading}
              onClick={() => setRejectTarget({ id: record.id, name: record.name })}
            >
              Reject
            </AppButton>
            <AppButton
              size="xs"
              disabled={actionLoading}
              onClick={() => void handleApprove(record.id, record.name)}
            >
              Approve
            </AppButton>
          </div>
        ),
      },
    ],
    [actionLoading, navigate],
  );

  return (
    <div>
      <LoadingOverlay visible={status === 'loading'} />
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guides', onClick: () => navigate(ROUTES.GUIDES) },
          { label: 'New Approvals' },
        ]}
      />

      <PageHeader
        title="New Guide Approvals"
        subtitle={`${pendingGuides.length} guides awaiting review`}
      />

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchUnverifiedAgents())}
        />
      )}

      {status !== 'failed' && (
        <DataTable<Guide>
          rowKey="id"
          columns={columns}
          dataSource={pendingGuides}
          pagination={false}
        />
      )}

      <RejectAgentModal
        open={Boolean(rejectTarget)}
        guideName={rejectTarget?.name}
        loading={actionLoading}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason) => void handleReject(reason)}
      />
    </div>
  );
}
