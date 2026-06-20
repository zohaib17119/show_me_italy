import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  FormTextarea,
  GuideCell,
  PayoutRow,
  SectionTitle,
  showToast,
  StatusBadge,
  Stepper,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { MOCK_PAYOUT_DETAIL } from '@/mocks';

export function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = MOCK_PAYOUT_DETAIL;
  const meta = getRouteMeta(`/payments/payouts/${id ?? 'sample'}`);

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={`${detail.guideName} · ${detail.monthLabel} · Submitted ${detail.submittedAt}`}
        extra={
          <>
            <AppButton variant="warn" onClick={() => showToast('📝 Revision sent')}>
              Request Revision
            </AppButton>
            <AppButton variant="danger" onClick={() => showToast('Denied')}>
              Deny
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => showToast(`✓ Payout approved! €${detail.netPayout} queued.`)}
            >
              Approve & Mark Paid
            </AppButton>
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AppCard>
            <SectionTitle style={{ marginBottom: 12 }}>
              Monthly Breakdown — {detail.tours} tours
            </SectionTitle>
            {detail.breakdown.map((row) => (
              <div
                key={row.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ flex: 1 }}>
                  <PayoutRow
                    date={`${row.day} ${row.month}`}
                    tour={row.tour}
                    guide={`${row.language} · ${row.hours}h`}
                    amount=""
                  />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  €{row.hourlyRate}/h
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                    minWidth: 48,
                    textAlign: 'right',
                  }}
                >
                  €{row.amount}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: '2px solid var(--border-color)',
                paddingTop: 12,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 10,
                  background: 'var(--g50)',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Net Payout
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--g600)' }}>
                  €{detail.netPayout.toFixed(2)}
                </span>
              </div>
            </div>
          </AppCard>

          <Stepper
            steps={[
              { label: 'Requested', status: 'done' },
              { label: 'Admin', status: 'active' },
              { label: 'Verified', status: 'wait' },
              { label: 'Paid', status: 'wait' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppCard title="Guide Info">
            <GuideCell
              initials={detail.guideInitials}
              name={detail.guideName}
              sub={detail.guideEmail}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                fontSize: 12,
                marginTop: 12,
              }}
            >
              <InfoRow label="Tours" value={String(detail.tours)} />
              <InfoRow label="Hours" value={`${detail.hours}h`} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <StatusBadge status="pending" />
              </div>
            </div>
          </AppCard>

          <AppCard title="Bank Reference">
            <FormGrid>
              <FormInput label="Transfer ID" placeholder="TRF-2026-04-001" />
              <FormTextarea
                label="Note"
                placeholder="Optional…"
                rows={3}
                style={{ minHeight: 60 }}
              />
            </FormGrid>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
