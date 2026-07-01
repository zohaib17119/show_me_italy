import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { GuideApplicationRow } from '@/api/mappers/agentMapper';
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
import uiStyles from '@/components/ui/data/ui.module.css';
import { ROUTES } from '@/constants/routes';
import {
  approveAgent,
  clearSelectedAgent,
  fetchAgentById,
  rejectAgent,
  selectAgentDetailStatus,
  selectSelectedAgent,
  selectSelectedAgentApplications,
} from '@/features/agent/agentSlice';
import type { GuideStatus } from '@/mocks/guides';
import type { TourStatus } from '@/types';
import { RejectAgentModal } from './components/RejectAgentModal';
import styles from './guides.module.css';

function formatRating(rating: number | null): string {
  if (rating == null) return '—';
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function guideStatusToBadge(status: GuideStatus, isActive?: boolean): TourStatus {
  if (status === 'pending') return 'pending';
  if (isActive === false) return 'inactive';
  return 'active';
}

export function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const detailStatus = useAppSelector(selectAgentDetailStatus);
  const guide = useAppSelector(selectSelectedAgent);
  const applications = useAppSelector(selectSelectedAgentApplications);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      void dispatch(fetchAgentById(id));
    }
    return () => {
      dispatch(clearSelectedAgent());
    };
  }, [dispatch, id]);

  const handleApprove = async () => {
    if (!guide) return;
    setActionLoading(true);
    try {
      await dispatch(approveAgent(guide.id)).unwrap();
      showToast(`✓ ${guide.name} approved!`);
      navigate(ROUTES.APPROVALS);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve guide');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!guide) return;
    setActionLoading(true);
    try {
      await dispatch(rejectAgent({ userId: guide.id, reason })).unwrap();
      showToast(`${guide.name} rejected`);
      setRejectOpen(false);
      navigate(ROUTES.APPROVALS);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject guide');
    } finally {
      setActionLoading(false);
    }
  };

  if (detailStatus === 'loading' && !guide) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className={styles.detailPage}>
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

  const isPending = guide.status === 'pending';

  const historyColumns: ColumnsType<GuideApplicationRow> = [
    {
      title: 'Applied At',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
    },
    {
      title: 'Tour Slot',
      dataIndex: 'tourSlot',
      key: 'tourSlot',
    },
    {
      title: 'Pay Rate',
      dataIndex: 'payRate',
      key: 'payRate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: GuideApplicationRow['status']) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div className={styles.detailPage}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guide Roster', onClick: () => navigate(ROUTES.GUIDES) },
          { label: guide.name },
        ]}
      />

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
        <div className={styles.guideHeaderAvatar}>{guide.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="page-header">
            <div style={{ minWidth: 0 }}>
              <h1 className="page-header-title">
                {guide.name}
                {guide.favorite && (
                  <span className={uiStyles.guideFavoriteStar} aria-label="Favorite">
                    {' '}
                    ★
                  </span>
                )}
              </h1>
              <p className="page-header-subtitle">
                {guide.email} · {guide.phone} · Active since {guide.activeSince}
              </p>
            </div>
            <div className="page-header-extra">
              {isPending ? (
                <>
                  <AppButton
                    variant="danger"
                    size="xs"
                    disabled={actionLoading}
                    onClick={() => setRejectOpen(true)}
                  >
                    Reject
                  </AppButton>
                  <AppButton size="xs" disabled={actionLoading} onClick={() => void handleApprove()}>
                    Approve
                  </AppButton>
                </>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
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
                <SectionLabel>Status</SectionLabel>
                <StatusBadge status={guideStatusToBadge(guide.status, guide.isActive)} />
              </div>
              <div>
                <SectionLabel>Certified</SectionLabel>
                {guide.certified ? (
                  <span className={styles.certYes}>✓ Yes</span>
                ) : (
                  <span className={styles.certPending}>⏳ Pending</span>
                )}
              </div>
              <div>
                <SectionLabel>Phone</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {guide.phone}
                </div>
              </div>
              <div>
                <SectionLabel>License</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {guide.license}
                </div>
              </div>
              <div>
                <SectionLabel>Verification</SectionLabel>
                <span className={guide.isActive ? styles.certYes : styles.certPending}>
                  {guide.isActive ? '✓ Verified' : 'Unverified'}
                </span>
                {guide.certificateUpload && (
                  <div style={{ marginTop: 6 }}>
                    <AppButton
                      variant="secondary"
                      size="xs"
                      onClick={() => window.open(guide.certificateUpload, '_blank', 'noopener')}
                    >
                      View Certificate
                    </AppButton>
                  </div>
                )}
              </div>
              <div>
                <SectionLabel>Admin Notes</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {guide.adminNotes?.trim() ? guide.adminNotes : '—'}
                </div>
              </div>
              <div>
                <SectionLabel>Rating</SectionLabel>
                <div className={styles.ratingValue}>
                  {guide.rating != null ? `⭐ ${formatRating(guide.rating)}` : '—'}
                </div>
              </div>
              <div>
                <SectionLabel>Cancellation %</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {guide.cancellationPercentage != null ? `${guide.cancellationPercentage}%` : '—'}
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Tour History</SectionTitle>
            <DataTable<GuideApplicationRow>
              rowKey="id"
              columns={historyColumns}
              dataSource={applications}
              pagination={false}
              size="small"
              scroll={{ x: '100%' }}
            />
          </AppCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
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
              onClick={() => navigate(ROUTES.PAYOUTS)}
            >
              View Payout →
            </AppButton>
          </AppCard>

          {!isPending && (
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
          )}
        </div>
      </div>

      <RejectAgentModal
        open={rejectOpen}
        guideName={guide.name}
        loading={actionLoading}
        onCancel={() => setRejectOpen(false)}
        onConfirm={(reason) => void handleReject(reason)}
      />
    </div>
  );
}
