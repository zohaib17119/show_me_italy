import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  LangChip,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import {
  approveAgent,
  fetchUnverifiedAgents,
  selectAgentStatus,
  selectUnverifiedGuides,
} from '@/features/agent/agentSlice';
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
  const status = useAppSelector(selectAgentStatus);

  useEffect(() => {
    void dispatch(fetchUnverifiedAgents());
  }, [dispatch]);

  const handleApprove = async (agentId: string, name: string) => {
    try {
      await dispatch(approveAgent({ agentId })).unwrap();
      showToast(`✓ ${name} approved!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve guide');
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

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

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
                <AppButton variant="secondary" size="xs" style={{ marginLeft: 'auto' }}>
                  View Doc
                </AppButton>
              </div>

              <div className={styles.approvalActions}>
                <AppButton variant="danger" size="xs" style={{ flex: 1 }}>
                  ✕ Reject
                </AppButton>
                <AppButton
                  size="xs"
                  style={{ flex: 1 }}
                  onClick={() => void handleApprove(guide.id, guide.name)}
                >
                  ✓ Approve
                </AppButton>
              </div>
            </AppCard>
          );
        })}
      </div>
    </div>
  );
}
