import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import type { AvailableGuideRow } from '@/api/mappers/availableGuideMapper';
import type { GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import type { SlotApplicantRow } from '@/api/mappers/slotApplicantMapper';
import {
  AppButton,
  AppCard,
  DataTable,
  GuideCell,
  LangChip,
  ListErrorState,
  // SearchInput,
  showToast,
  StatusBadge,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  assignGuideManually,
  fetchAvailableGuides,
  fetchSlotApplicants,
  selectApplicantMutationStatus,
  selectAvailableGuides,
  selectAvailableGuidesError,
  selectAvailableGuidesStatus,
  selectManualAssignStatus,
  selectSlotApplicants,
  selectSlotApplicantsError,
  selectSlotApplicantsStatus,
  selectSlotSummary,
  updateSlotApplicantStatus,
} from '@/features/applications/applicationsSlice';

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, ...valueStyle }}>{value}</span>
    </div>
  );
}

function withStickyActions<T extends object>(columns: ColumnsType<T>): ColumnsType<T> {
  return columns.map((col) => {
    if (col.key !== 'actions') return col;
    return {
      ...col,
      fixed: 'right' as const,
      width: (col as ColumnType<T>).width ?? 130,
    };
  }) as ColumnsType<T>;
}

export function AssignmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.ASSIGNMENT);

  const slotFromState = location.state as GuideSlotRow | null | undefined;
  const tourSlotIdParam = searchParams.get('tourSlotId');
  const tourSlotId = tourSlotIdParam ? Number(tourSlotIdParam) : NaN;
  const hasValidTourSlotId = !Number.isNaN(tourSlotId) && tourSlotId > 0;

  const applicants = useAppSelector(selectSlotApplicants);
  const slotSummary = useAppSelector(selectSlotSummary);
  const status = useAppSelector(selectSlotApplicantsStatus);
  const error = useAppSelector(selectSlotApplicantsError);
  const availableGuides = useAppSelector(selectAvailableGuides);
  const availableGuidesStatus = useAppSelector(selectAvailableGuidesStatus);
  const availableGuidesError = useAppSelector(selectAvailableGuidesError);
  const applicantMutationStatus = useAppSelector(selectApplicantMutationStatus);
  const manualAssignStatus = useAppSelector(selectManualAssignStatus);

  const [actingId, setActingId] = useState<string | null>(null);
  const [actingGuideId, setActingGuideId] = useState<string | null>(null);
  // const [overrideSearch, setOverrideSearch] = useState('');

  const loadApplicants = useCallback(() => {
    if (!hasValidTourSlotId) return;
    void dispatch(fetchSlotApplicants(tourSlotId));
  }, [dispatch, hasValidTourSlotId, tourSlotId]);

  const loadAvailableGuides = useCallback(() => {
    void dispatch(fetchAvailableGuides());
  }, [dispatch]);

  useFetchErrorToast(status, error);
  useFetchErrorToast(availableGuidesStatus, availableGuidesError);

  useEffect(() => {
    if (!hasValidTourSlotId) return;
    loadApplicants();
    loadAvailableGuides();
  }, [hasValidTourSlotId, loadApplicants, loadAvailableGuides]);

  const subtitle = useMemo(() => {
    if (slotSummary) {
      const timePart = slotFromState?.timeRange ? ` · ${slotFromState.timeRange}` : '';
      return `${slotSummary.tourName} · ${slotSummary.dateLabel}${timePart} · ${slotSummary.languageLabel}`;
    }
    if (slotFromState) {
      return `${slotFromState.tourName} · ${slotFromState.dateLabel} · ${slotFromState.timeRange} · ${slotFromState.language}`;
    }
    if (hasValidTourSlotId) {
      return `Tour slot #${tourSlotId}`;
    }
    return meta.subtitle;
  }, [hasValidTourSlotId, meta.subtitle, slotFromState, slotSummary, tourSlotId]);

  const filteredAvailableGuides = useMemo(() => {
    // const query = overrideSearch.trim().toLowerCase();
    const query = "";
    if (query === '') return availableGuides;
    return availableGuides.filter(
      (guide) =>
        guide.name.toLowerCase().includes(query) ||
        guide.email.toLowerCase().includes(query) ||
        guide.phoneNumber.toLowerCase().includes(query) ||
        guide.languagesLabel.toLowerCase().includes(query),
    );
  // }, [availableGuides, overrideSearch]);
  }, [availableGuides]);

  const handleStatusUpdate = useCallback(
    async (
      row: SlotApplicantRow,
      nextStatus: 'Approved' | 'Rejected',
      successMessage: string,
    ) => {
      if (row.applicationId == null) {
        showToast('Application ID not available yet');
        return;
      }
      setActingId(row.id);
      try {
        await dispatch(
          updateSlotApplicantStatus({
            applicationId: row.applicationId,
            status: nextStatus,
            tourSlotId,
          }),
        ).unwrap();
        showToast(successMessage);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to update applicant');
      } finally {
        setActingId(null);
      }
    },
    [dispatch, tourSlotId],
  );

  const handleManualAssign = useCallback(
    async (row: AvailableGuideRow) => {
      setActingGuideId(row.guideId);
      try {
        await dispatch(
          assignGuideManually({ guideId: row.guideId, tourSlotId }),
        ).unwrap();
        showToast('Guide assigned');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to assign guide');
      } finally {
        setActingGuideId(null);
      }
    },
    [dispatch, tourSlotId],
  );

  const columns: ColumnsType<SlotApplicantRow> = useMemo(
    () =>
      withStickyActions<SlotApplicantRow>([
        {
          title: 'Guide',
          dataIndex: 'guideName',
          key: 'guide',
          width: 180,
          render: (_, row) => (
            <GuideCell initials={row.guideInitials} name={row.guideName} 
            // sub={row.languagesLabel} 
            sub={""} />
          ),
        },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
        { title: 'Phone', dataIndex: 'phoneNumber', key: 'phone', width: 130 },
        {
          title: 'Languages',
          dataIndex: 'languages',
          key: 'languages',
          width: 120,
          render: (langs: SlotApplicantRow['languages']) => (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {langs.map((code) => (
                <LangChip key={code} code={code} />
              ))}
            </div>
          ),
        },
        {
          title: 'Applied At',
          dataIndex: 'appliedAt',
          key: 'appliedAt',
          width: 150,
          render: (value: string) => (
            <span style={{ color: 'var(--text-muted)' }}>{value}</span>
          ),
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          width: 110,
          render: (s: SlotApplicantRow['status']) => <StatusBadge status={s} />,
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, row) => {
            const isApproved = row.statusRaw.toLowerCase().includes('approve');
            const isRejected = row.statusRaw.toLowerCase().includes('reject');
            const isBusy = applicantMutationStatus === 'loading' && actingId === row.id;
            const missingApplicationId = row.applicationId == null;

            if (isApproved) {
              return (
                <AppButton
                  variant="danger"
                  size="xs"
                  disabled={isBusy}
                  onClick={() => {
                    if (missingApplicationId) {
                      showToast('Application ID not available yet');
                      return;
                    }
                    void handleStatusUpdate(row, 'Rejected', 'Guide unassigned');
                  }}
                >
                  Unassign
                </AppButton>
              );
            }

            if (isRejected) {
              return (
                <AppButton
                  variant="primary"
                  size="xs"
                  disabled={isBusy}
                  onClick={() => {
                    if (missingApplicationId) {
                      showToast('Application ID not available yet');
                      return;
                    }
                    void handleStatusUpdate(row, 'Approved', 'Guide assigned');
                  }}
                >
                  Assign
                </AppButton>
              );
            }

            return (
              <div style={{ display: 'flex', gap: 5 }}>
                <AppButton
                  variant="primary"
                  size="xs"
                  disabled={isBusy}
                  onClick={() => {
                    if (missingApplicationId) {
                      showToast('Application ID not available yet');
                      return;
                    }
                    void handleStatusUpdate(row, 'Approved', 'Guide assigned');
                  }}
                >
                  Assign
                </AppButton>
                <AppButton
                  variant="danger"
                  size="xs"
                  disabled={isBusy}
                  onClick={() => {
                    if (missingApplicationId) {
                      showToast('Application ID not available yet');
                      return;
                    }
                    void handleStatusUpdate(row, 'Rejected', 'Application rejected');
                  }}
                >
                  Reject
                </AppButton>
              </div>
            );
          },
        },
      ]),
    [actingId, applicantMutationStatus, handleStatusUpdate],
  );

  const overrideColumns: ColumnsType<AvailableGuideRow> = useMemo(
    () =>
      withStickyActions<AvailableGuideRow>([
        {
          title: 'Guide',
          key: 'guide',
          width: 200,
          render: (_, row) => (
            <GuideCell initials={row.initials} name={row.name} sub={row.email} />
          ),
        },
        { title: 'Phone', dataIndex: 'phoneNumber', key: 'phone', width: 130 },
        {
          title: 'Languages',
          key: 'languages',
          width: 160,
          render: (_, row) =>
            row.languages.length > 0 ? (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {row.languages.map((code) => (
                  <LangChip key={code} code={code} />
                ))}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>{row.languagesLabel}</span>
            ),
        },
        { title: 'License', dataIndex: 'license', key: 'license', width: 120 },
        {
          title: 'Status',
          key: 'status',
          width: 100,
          render: (_, row) => (
            <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
          ),
        },
        {
          title: 'Actions',
          key: 'actions',
          render: (_, row) => {
            const isBusy = manualAssignStatus === 'loading' && actingGuideId === row.guideId;
            return (
              <AppButton
                variant="primary"
                size="xs"
                disabled={isBusy}
                onClick={() => void handleManualAssign(row)}
              >
                Assign
              </AppButton>
            );
          },
        },
      ]),
    [actingGuideId, handleManualAssign, manualAssignStatus],
  );

  if (!hasValidTourSlotId) {
    return (
      <div>
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        <AppCard>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Select a tour slot from the guide slots list to assign applicants.
          </p>
          <AppButton
            variant="primary"
            size="sm"
            style={{ marginTop: 12 }}
            onClick={() => navigate(ROUTES.GUIDE_SLOTS)}
          >
            Go to Guide Slots
          </AppButton>
        </AppCard>
      </div>
    );
  }

  const applicantsInitialLoading = status === 'loading' && applicants.length === 0;
  const applicantsRefetching = status === 'loading' && applicants.length > 0;

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={subtitle}
        extra={
          <AppButton variant="secondary" size="sm" onClick={() => navigate(ROUTES.GUIDE_SLOTS)}>
            Back to Slots
          </AppButton>
        }
      />

      <div className="layoutTwoColWide">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <AppCard
            title="Applicants"
            extra={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                {applicantsRefetching && <Spin size="small" />}
                {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
              </span>
            }
          >
            {status === 'failed' && (
              <ListErrorState message={error} onRetry={loadApplicants} />
            )}

            {status !== 'failed' && applicantsInitialLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin />
              </div>
            )}

            {status !== 'failed' && !applicantsInitialLoading && (
              <DataTable<SlotApplicantRow>
                rowKey="id"
                columns={columns}
                dataSource={applicants}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </AppCard>

          <AppCard title="Manual Override">
            {/* <SearchInput
              placeholder="Search by name, email, or language…"
              value={overrideSearch}
              onChange={(e) => setOverrideSearch(e.target.value)}
              wrapperStyle={{ marginBottom: 10 }}
            /> */}
            <div
              style={{
                marginBottom: 12,
                background: 'var(--orange-bg)',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 11,
                color: 'var(--text-secondary)',
                border: '1px solid color-mix(in srgb, var(--orange) 20%, transparent)',
              }}
            >
              Override assigns without application — guide will be notified.
            </div>

            {availableGuidesStatus === 'failed' && (
              <ListErrorState message={availableGuidesError} onRetry={loadAvailableGuides} />
            )}

            {availableGuidesStatus === 'loading' && availableGuides.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin />
              </div>
            )}

            {availableGuidesStatus !== 'failed' &&
              !(availableGuidesStatus === 'loading' && availableGuides.length === 0) && (
                <DataTable<AvailableGuideRow>
                  rowKey="id"
                  columns={overrideColumns}
                  dataSource={filteredAvailableGuides}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                />
              )}
          </AppCard>
        </div>

        <AppCard title="Slot Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 }}>
            <SummaryRow
              label="Tour"
              value={slotSummary?.tourName ?? slotFromState?.tourName ?? '—'}
            />
            <SummaryRow
              label="Date"
              value={slotSummary?.dateLabel ?? slotFromState?.dateLabel ?? '—'}
            />
            <SummaryRow
              label="Language"
              value={slotSummary?.languageLabel ?? slotFromState?.language ?? '—'}
            />
            <SummaryRow label="Time" value={slotFromState?.timeRange ?? '—'} />
            <SummaryRow
              label="Filled"
              value={slotSummary?.filledLabel ?? '—'}
              valueStyle={
                slotSummary ? { color: 'var(--orange)', fontWeight: 700 } : undefined
              }
            />
            <SummaryRow
              label="Pay Rate"
              value={slotSummary?.payRateLabel ?? '—'}
              valueStyle={
                slotSummary?.payRateLabel && slotSummary.payRateLabel !== '—'
                  ? { color: 'var(--g600)', fontWeight: 700 }
                  : undefined
              }
            />
            <div style={{ height: 1, background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              {slotSummary ? (
                <StatusBadge status={slotSummary.status} />
              ) : (
                <span style={{ fontWeight: 600 }}>—</span>
              )}
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
