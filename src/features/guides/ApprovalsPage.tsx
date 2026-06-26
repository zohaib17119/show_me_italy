import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  LangChip,
  ListErrorState,
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
import { RejectAgentModal } from './components/RejectAgentModal';
import styles from './guides.module.css';

const AVATAR_STYLES = [
  { background: '#fce4f3', color: '#E91E90' },
  { background: '#e8f8f5', color: '#1ABC9C' },
  { background: '#fff0e0', color: '#E67E22' },
];

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

  return (
    <div>
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

      {status === 'loading' && pendingGuides.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchUnverifiedAgents())}
        />
      )}

      {status !== 'failed' && (
      <div className={styles.approvalGrid}>
        {pendingGuides.map((guide, index) => {
          const avatarStyle = AVATAR_STYLES[index % AVATAR_STYLES.length];

          return (
            <AppCard key={guide.id}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div
                  className={styles.approvalAvatar}
                  style={{ background: avatarStyle.background, color: avatarStyle.color }}
                >
                  {guide.initials}
                </div>
                <div>
                  <div className={styles.approvalName}>{guide.name}</div>
                  <div className={styles.approvalEmail}>{guide.email}</div>
                  <div className={styles.approvalRegistered}>
                    {registeredLabel(guide.adminNote)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {guide.languages.map((lang) => (
                  <LangChip key={lang} code={lang} size="md" />
                ))}
              </div>

              <div className={styles.licenseRow}>
                📄 {guide.license}
                {guide.certificateUpload ? (
                  <AppButton
                    variant="secondary"
                    size="xs"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => window.open(guide.certificateUpload, '_blank', 'noopener')}
                  >
                    View Doc
                  </AppButton>
                ) : (
                  <AppButton variant="secondary" size="xs" style={{ marginLeft: 'auto' }} disabled>
                    No Doc
                  </AppButton>
                )}
              </div>

              <div className={styles.approvalActions}>
                <AppButton
                  variant="secondary"
                  size="xs"
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/guides/${guide.id}`)}
                >
                  View Profile
                </AppButton>
                <AppButton
                  variant="danger"
                  size="xs"
                  style={{ flex: 1 }}
                  disabled={actionLoading}
                  onClick={() => setRejectTarget({ id: guide.id, name: guide.name })}
                >
                  ✕ Reject
                </AppButton>
                <AppButton
                  size="xs"
                  style={{ flex: 1 }}
                  disabled={actionLoading}
                  onClick={() => void handleApprove(guide.id, guide.name)}
                >
                  ✓ Approve
                </AppButton>
              </div>
            </AppCard>
          );
        })}
      </div>
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
