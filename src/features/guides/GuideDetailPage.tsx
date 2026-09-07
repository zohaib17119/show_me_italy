import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Spin, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { axiosInstance, getApiErrorMessage } from '@/api/axiosInstance';
import type { GuideApplicationRow } from '@/api/mappers/agentMapper';
import type { GuideAvailabilityRecord } from '@/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  DataTable,
  GuideAvatar,
  LangChip,
  LockedAction,
  SectionLabel,
  SectionTitle,
  StatusBadge,
  TablePagination,
  showToast,
} from '@/components/ui';
import { useCan } from '@/features/auth/useCan';
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
  selectSelectedAgentApplicationsTotal,
  selectSelectedAgentPendingApplications,
} from '@/features/agent/agentSlice';
import type { GuideStatus } from '@/mocks/guides';
import type { LangCode, TourStatus } from '@/types';
import { DeactivateGuideModal } from './components/DeactivateGuideModal';
import { PreviewCertificateModal } from './components/PreviewCertificateModal';
import { RejectAgentModal } from './components/RejectAgentModal';
import styles from './guides.module.css';

const HISTORY_PAGE_SIZE_OPTIONS = [25, 50, 100];
const AVAIL_PAGE_SIZE_OPTIONS = [10, 25, 50];

function unwrapPagedAvailability(
  payload: unknown,
): { records: GuideAvailabilityRecord[]; totalRecords: number } {
  if (Array.isArray(payload)) {
    return {
      records: payload as GuideAvailabilityRecord[],
      totalRecords: payload.length,
    };
  }
  if (!payload || typeof payload !== 'object') {
    return { records: [], totalRecords: 0 };
  }

  const obj = payload as Record<string, unknown>;
  const inner = 'status_code' in obj && 'data' in obj ? obj.data : payload;

  if (Array.isArray(inner)) {
    return {
      records: inner as GuideAvailabilityRecord[],
      totalRecords: inner.length,
    };
  }

  if (inner && typeof inner === 'object') {
    const page = inner as { data?: unknown; totalRecords?: number };
    const records = Array.isArray(page.data)
      ? (page.data as GuideAvailabilityRecord[])
      : [];
    const totalRecords =
      typeof page.totalRecords === 'number' ? page.totalRecords : records.length;
    return { records, totalRecords };
  }

  return { records: [], totalRecords: 0 };
}

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
  const can = useCan();
  const canApprove = can('Guides.Approve');
  const canReject = can('Guides.Reject');
  // Used when Admin Actions card is restored:
  // const canActivate = can('Guides.Activate');
  // const canDeactivate = can('Guides.Deactivate');
  // const canEdit = can('Guides.Edit');
  const canAssign = can('Applications.Assign');
  const dispatch = useAppDispatch();
  const detailStatus = useAppSelector(selectAgentDetailStatus);
  const guide = useAppSelector(selectSelectedAgent);
  const applications = useAppSelector(selectSelectedAgentApplications);
  const applicationsTotal = useAppSelector(selectSelectedAgentApplicationsTotal);
  const pendingApplications = useAppSelector(selectSelectedAgentPendingApplications);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvingApplicationId, setApprovingApplicationId] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(25);
  const [availability, setAvailability] = useState<GuideAvailabilityRecord[]>([]);
  const [availabilityTotal, setAvailabilityTotal] = useState(0);
  const [availPage, setAvailPage] = useState(1);
  const [availPageSize, setAvailPageSize] = useState(10);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [deleteAvailId, setDeleteAvailId] = useState<number | null>(null);
  const [deleteAvailLoading, setDeleteAvailLoading] = useState(false);

  useEffect(() => {
    setHistoryPage(1);
    setAvailPage(1);
  }, [id]);

  useEffect(() => {
    if (id) {
      void dispatch(
        fetchAgentById({
          userId: id,
          pageNumber: historyPage,
          pageSize: historyPageSize,
        }),
      );
    }
  }, [dispatch, id, historyPage, historyPageSize]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedAgent());
    };
  }, [dispatch, id]);

  const loadAvailability = useCallback(async () => {
    if (!id) return;
    setAvailabilityLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/GuideAvailability/guide/${id}`, {
        params: { pageNumber: availPage, pageSize: availPageSize },
      });
      const page = unwrapPagedAvailability(data);
      setAvailability(page.records);
      setAvailabilityTotal(page.totalRecords);
    } catch {
      setAvailability([]);
      setAvailabilityTotal(0);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [id, availPage, availPageSize]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const handleDeleteAvailability = async () => {
    if (deleteAvailId == null) return;
    setDeleteAvailLoading(true);
    try {
      await axiosInstance.delete(`/api/GuideAvailability/${deleteAvailId}`);
      showToast('Availability record deleted');
      if (availability.length <= 1 && availPage > 1) {
        setAvailPage((prev) => prev - 1);
      } else {
        await loadAvailability();
      }
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setDeleteAvailLoading(false);
      setDeleteAvailId(null);
    }
  };

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
        void dispatch(
          fetchAgentById({
            userId: guide.id,
            pageNumber: historyPage,
            pageSize: historyPageSize,
          }),
        );
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
      await dispatch(
        fetchAgentById({
          userId: guide.id,
          pageNumber: historyPage,
          pageSize: historyPageSize,
        }),
      ).unwrap();
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

  // const DAY_KEYS: (keyof GuideAvailabilityRecord)[] = [
  //   'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  // ];
  // const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const availabilityColumns: ColumnsType<GuideAvailabilityRecord> = [
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 100,
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 100,
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    },
    {
      title: 'Slots',
      key: 'slots',
      width: 180,
      render: (_: unknown, record: GuideAvailabilityRecord) =>
        record.slots && record.slots.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {record.slots.map((s) => (
              <div key={s.slotId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag
                  color="blue"
                  style={{ marginInlineEnd: 0, flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  {s.slotName}
                </Tag>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        ) : '—',
    },
    {
      title: 'Recurring',
      key: 'isRecurring',
      width: 100,
      render: (_: unknown, record: GuideAvailabilityRecord) =>
        record.isRecurring ? (
          <Tag color="purple">Recurring</Tag>
        ) : (
          <Tag color="default">Non-Recurring</Tag>
        ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (v: boolean) =>
        v ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      fixed: 'right' as const,
      render: (_: unknown, record: GuideAvailabilityRecord) => (
        <AppButton
          variant="danger"
          size="xs"
          onClick={() => setDeleteAvailId(record.guideAvailableSlotId)}
        >
          Delete
        </AppButton>
      ),
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
        <LockedAction allowed={canAssign}>
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
        </LockedAction>
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
                  <LockedAction allowed={canReject}>
                    <AppButton
                      variant="danger"
                      size="xs"
                      disabled={actionLoading}
                      onClick={() => setRejectOpen(true)}
                    >
                      Reject
                    </AppButton>
                  </LockedAction>
                  <LockedAction allowed={canApprove}>
                    <AppButton size="xs" disabled={actionLoading} onClick={() => void handleApprove()}>
                      Approve
                    </AppButton>
                  </LockedAction>
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
              dataSource={Array.isArray(pendingApplications) ? pendingApplications : []}
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
              dataSource={Array.isArray(applications) ? applications : []}
              pagination={false}
              size="small"
              scroll={{ x: '100%' }}
            />
            <TablePagination
              page={historyPage}
              pageSize={historyPageSize}
              total={applicationsTotal}
              pageSizeOptions={HISTORY_PAGE_SIZE_OPTIONS}
              onPageChange={setHistoryPage}
              onPageSizeChange={(size) => {
                setHistoryPageSize(size);
                setHistoryPage(1);
              }}
            />
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Availability Schedule</SectionTitle>
            <DataTable<GuideAvailabilityRecord>
              rowKey="guideAvailableSlotId"
              loading={availabilityLoading}
              columns={availabilityColumns}
              dataSource={Array.isArray(availability) ? availability : []}
              pagination={false}
              size="small"
              scroll={{ x: '100%' }}
              locale={{ emptyText: 'No availability records found' }}
            />
            <TablePagination
              page={availPage}
              pageSize={availPageSize}
              total={availabilityTotal}
              pageSizeOptions={AVAIL_PAGE_SIZE_OPTIONS}
              onPageChange={setAvailPage}
              onPageSizeChange={(size) => {
                setAvailPageSize(size);
                setAvailPage(1);
              }}
            />
          </AppCard>
        </div>

        {/* Temporarily hidden — restore when earnings / admin actions return
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
          </AppCard>

          {!isPending && (
            <AppCard>
              <SectionTitle style={{ marginBottom: 10 }}>Admin Actions</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <LockedAction allowed={canEdit}>
                  <AppButton
                    variant="secondary"
                    size="xs"
                    style={{ width: '100%' }}
                    onClick={() => showToast('✓ Edit languages')}
                  >
                    Edit Languages
                  </AppButton>
                </LockedAction>
                <LockedAction allowed={isInactive ? canActivate : canDeactivate}>
                  <AppButton
                    variant={isInactive ? 'primary' : 'warn'}
                    size="xs"
                    style={{ width: '100%' }}
                    disabled={actionLoading}
                    onClick={() => setDeactivateOpen(true)}
                  >
                    {isInactive ? 'Activate Guide' : 'Deactivate Guide'}
                  </AppButton>
                </LockedAction>
              </div>
            </AppCard>
          )}
        </div>
        */}
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

      <Modal
        open={deleteAvailId != null}
        title="Delete Availability Record"
        okText="Yes, Delete"
        okButtonProps={{ danger: true, loading: deleteAvailLoading }}
        cancelText="Cancel"
        onOk={() => void handleDeleteAvailability()}
        onCancel={() => setDeleteAvailId(null)}
        centered
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete this availability record? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
