import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  LangChip,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { MOCK_GUIDES } from '@/mocks';
import styles from './guides.module.css';

const AVATAR_STYLES: Record<string, { background: string; color: string }> = {
  'guide-yuki-tanaka': { background: '#fce4f3', color: '#E91E90' },
  'guide-carlos-silva': { background: '#e8f8f5', color: '#1ABC9C' },
  'guide-li-wei': { background: '#fff0e0', color: '#E67E22' },
};

function registeredLabel(activeSince: string, adminNote: string): string {
  const match = adminNote.match(/Registered (\d+ \w+ \d+)/);
  if (match) return `Registered: ${match[1]}`;
  return `Active since ${activeSince}`;
}

export function ApprovalsPage() {
  const navigate = useNavigate();

  const pendingGuides = useMemo(
    () => MOCK_GUIDES.filter((guide) => guide.status === 'pending'),
    [],
  );

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guides', onClick: () => navigate(ROUTES.GUIDES) },
          { label: 'New Approvals' },
        ]}
      />

      <PageHeader title="New Guide Approvals" subtitle="3 guides awaiting review" />

      <div className={styles.approvalGrid}>
        {pendingGuides.map((guide) => {
          const avatarStyle = AVATAR_STYLES[guide.id] ?? {
            background: 'var(--g200)',
            color: 'var(--g700)',
          };

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
                    {registeredLabel(guide.activeSince, guide.adminNote)}
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
                  onClick={() => showToast(`✓ ${guide.name} approved!`)}
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
