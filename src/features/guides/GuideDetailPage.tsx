import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  DataTable,
  LangChip,
  SectionLabel,
  SectionTitle,
  StatusBadge,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { getGuideById, type GuideTourHistory } from '@/mocks';
import type { TourStatus } from '@/types';
import styles from './guides.module.css';

function historyStatusToBadge(status: GuideTourHistory['status']): TourStatus {
  if (status === 'paid') return 'approved';
  if (status === 'completed') return 'completed';
  if (status === 'confirmed') return 'confirmed';
  return 'pending';
}

export function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guide = id ? getGuideById(id) : undefined;

  if (!guide) {
    return (
      <div>
        <BreadcrumbNav
          items={[
            { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
            { label: 'Guide Roster', onClick: () => navigate(ROUTES.GUIDES) },
            { label: 'Not Found' },
          ]}
        />
        <PageHeader title="Guide Not Found" />
      </div>
    );
  }

  const historyColumns: ColumnsType<GuideTourHistory> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Tour', dataIndex: 'tour', key: 'tour' },
    {
      title: 'Lang',
      dataIndex: 'language',
      key: 'language',
      render: (lang) => <LangChip code={lang} />,
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <strong>€{amount}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: GuideTourHistory['status']) => (
        <StatusBadge status={historyStatusToBadge(status)} />
      ),
    },
  ];

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guide Roster', onClick: () => navigate(ROUTES.GUIDES) },
          { label: guide.name },
        ]}
      />

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div className={styles.guideHeaderAvatar}>{guide.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <PageHeader
            title={guide.name}
            subtitle={`${guide.email} · ${guide.phone} · Active since ${guide.activeSince}`}
            extra={
              <>
                <AppButton variant="danger" size="xs">
                  Deactivate
                </AppButton>
                <AppButton variant="secondary" size="xs">
                  Edit Profile
                </AppButton>
                <AppButton size="xs" onClick={() => showToast('✓ Note added')}>
                  Add Note
                </AppButton>
              </>
            }
          />
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AppCard>
            <div className={styles.infoGrid}>
              <div>
                <SectionLabel>Languages</SectionLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {guide.languages.map((lang) => (
                    <LangChip key={lang} code={lang} size="md" />
                  ))}
                </div>
              </div>
              <div>
                <SectionLabel>License</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {guide.license}
                </div>
              </div>
              <div>
                <SectionLabel>Certification</SectionLabel>
                <span className={styles.certYes}>
                  {guide.certified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div>
                <SectionLabel>Rating</SectionLabel>
                <div className={styles.ratingValue}>
                  {guide.rating != null ? `⭐ ${guide.rating} / 5.0` : '—'}
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Tour History</SectionTitle>
            <DataTable<GuideTourHistory>
              rowKey={(row) => `${row.date}-${row.language}-${row.tour}`}
              columns={historyColumns}
              dataSource={guide.tourHistory}
              pagination={false}
              size="small"
            />
          </AppCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppCard>
            <SectionTitle style={{ marginBottom: 12 }}>Earnings</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className={styles.earningsRow}>
                <span className={styles.earningsLabel}>Total Paid</span>
                <span className={styles.earningsValue} style={{ color: 'var(--g600)' }}>
                  €{guide.earnings.totalPaid.toLocaleString()}
                </span>
              </div>
              <div className={styles.earningsRow}>
                <span className={styles.earningsLabel}>Pending</span>
                <span className={styles.earningsValue} style={{ color: 'var(--orange)' }}>
                  €{guide.earnings.pending.toLocaleString()}
                </span>
              </div>
              <div className={styles.earningsRow}>
                <span className={styles.earningsLabel}>Total Tours</span>
                <span className={styles.earningsValue}>{guide.earnings.totalTours}</span>
              </div>
            </div>
            <AppButton
              variant="secondary"
              size="xs"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => navigate('/payments/payouts/sample')}
            >
              View Payout →
            </AppButton>
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Admin Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AppButton
                variant="secondary"
                size="xs"
                style={{ width: '100%' }}
                onClick={() => showToast('✓ Edit languages')}
              >
                Edit Languages
              </AppButton>
              <AppButton variant="warn" size="xs" style={{ width: '100%' }}>
                Deactivate Guide
              </AppButton>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
