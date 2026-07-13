import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { GuideApplicationRow } from '@/api/mappers/agentMapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  DataTable,
  GuideAvatar,
  LangChip,
  SectionLabel,
  SectionTitle,
  StatusBadge,
  showToast,
} from '@/components/ui';
import uiStyles from '@/components/ui/data/ui.module.css';
import { ROUTES } from '@/constants/routes';
import { applicationsApi } from '@/features/applications/applicationsApi';
import {
  approveAgent,
  clearSelectedAgent,
  setAgentActiveStatus,
  fetchAgentById,
  rejectAgent,
  selectAgentDetailStatus,
  selectSelectedAgent,
  selectSelectedAgentApplications,
  selectSelectedAgentPendingApplications,
} from '@/features/agent/agentSlice';
import type { GuideStatus } from '@/mocks/guides';
import type { LangCode, TourStatus } from '@/types';
import { DeactivateGuideModal } from './components/DeactivateGuideModal';
import { PreviewCertificateModal } from './components/PreviewCertificateModal';
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
  const pendingApplications = useAppSelector(selectSelectedAgentPendingApplications);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvingApplicationId, setApprovingApplicationId] = useState<number | null>(null);

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

  const handleToggleActiveStatus = async () => {
    if (!guide) return;
    const activating = guide.isActive === false;
    setActionLoading(true);
    try {
      await dispatch(
        setAgentActiveStatus({ userId: guide.id, isActive: activating }),
      ).unwrap();
      showToast(`${guide.name} ${activating ? 'activated' : 'deactivated'}`);
      setDeactivateOpen(false);
      if (activating) {
        void dispatch(fetchAgentById(guide.id));
      } else {
        navigate(ROUTES.GUIDES);
      }
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : `Failed to ${activating ? 'activate' : 'deactivate'} guide`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: number) => {
    if (!guide || !applicationId) return;
    setApprovingApplicationId(applicationId);
    try {
      await applicationsApi.approveGuideApplication({
        applicationId,
        status: 'Approved',
      });
      showToast('✓ Application approved');
      await dispatch(fetchAgentById(guide.id)).unwrap();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setApprovingApplicationId(null);
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
  const isInactive = guide.isActive === false;

  const historyColumns: ColumnsType<GuideApplicationRow> = [
    {
      title: 'Tour Type',
      dataIndex: 'tourTypeName',
      key: 'tourTypeName',
    },
    {
      title: 'Slot Date',
      dataIndex: 'slotDate',
      key: 'slotDate',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) =>
        language && language !== '—' ? (
          <LangChip code={language as LangCode} />
        ) : (
          '—'
        ),
    },
    {
      title: 'Applied At',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
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

  const pendingColumns: ColumnsType<GuideApplicationRow> = [
    {
      title: 'Tour Type',
      dataIndex: 'tourTypeName',
      key: 'tourTypeName',
    },
    {
      title: 'Slot Date',
      dataIndex: 'slotDate',
      key: 'slotDate',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      render: (language: string) =>
        language && language !== '—' ? (
          <LangChip code={language as LangCode} />
        ) : (
          '—'
        ),
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <AppButton
          size="xs"
          disabled={
            !record.applicationId ||
            approvingApplicationId === record.applicationId ||
            actionLoading
          }
          onClick={() => void handleApproveApplication(record.applicationId)}
        >
          {approvingApplicationId === record.applicationId ? 'Approving…' : 'Approve'}
        </AppButton>
      ),
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
        <GuideAvatar
          initials={guide.initials}
          profilePicture={guide.profilePicture}
          size="lg"
          alt={guide.name}
        />
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
              ) : null}
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
                {guide.certificateUpload?.trim() ? (
                  <div style={{ marginTop: 6 }}>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setCertificatePreviewOpen(true)}
                    >
                      View Certificate
                    </AppButton>
                  </div>
                ) : (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    Certificate not uploaded
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
            <SectionTitle style={{ marginBottom: 10 }}>Pending Applications</SectionTitle>
            <DataTable<GuideApplicationRow>
              rowKey="id"
              columns={pendingColumns}
              dataSource={pendingApplications}
              pagination={false}
              size="small"
              scroll={{ x: '100%' }}
              locale={{ emptyText: 'No pending applications' }}
            />
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
            {/* Hidden until payouts work resumes:
            <AppButton
              variant="secondary"
              size="xs"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => navigate(ROUTES.PAYOUTS)}
            >
              View Payout →
            </AppButton>
            */}
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
                <AppButton
                  variant={isInactive ? 'primary' : 'warn'}
                  size="xs"
                  style={{ width: '100%' }}
                  disabled={actionLoading}
                  onClick={() => setDeactivateOpen(true)}
                >
                  {isInactive ? 'Activate Guide' : 'Deactivate Guide'}
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

      <DeactivateGuideModal
        open={deactivateOpen}
        guideName={guide.name}
        mode={isInactive ? 'activate' : 'deactivate'}
        loading={actionLoading}
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={() => void handleToggleActiveStatus()}
      />

      <PreviewCertificateModal
        open={certificatePreviewOpen}
        certificateUrl={guide.certificateUpload?.trim() || null}
        guideName={guide.name}
        onClose={() => setCertificatePreviewOpen(false)}
      />
    </div>
  );
}
