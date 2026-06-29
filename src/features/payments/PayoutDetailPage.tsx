import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormGrid,
  FormInput,
  FormTextarea,
  GuideCell,
  SectionTitle,
  showToast,
  StatusBadge,
  Stepper,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import {
  fetchWalletData,
  selectPayoutById,
  selectWalletStatus,
} from '@/features/wallet/walletSlice';

export function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectWalletStatus);
  const payout = useAppSelector((state) => (id ? selectPayoutById(state, id) : undefined));
  const meta = getRouteMeta(`/payments/payouts/${id ?? 'sample'}`);

  useEffect(() => {
    void dispatch(fetchWalletData());
  }, [dispatch]);

  if (status === 'loading' && !payout) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!payout) {
    return <PageHeader title="Payout Not Found" />;
  }

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={`${payout.guideName} · ${payout.monthLabel} · Submitted ${payout.submittedAt}`}
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
              onClick={() => showToast(`✓ Payout approved! €${payout.amount} queued.`)}
            >
              Approve & Mark Paid
            </AppButton>
          </>
        }
      />

      <div className="layoutTwoCol">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AppCard>
            <SectionTitle style={{ marginBottom: 12 }}>
              Payout Summary — {payout.tours} tours
            </SectionTitle>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 10,
                background: 'var(--g50)',
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800 }}>Net Payout</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--g600)' }}>
                €{payout.amount.toFixed(2)}
              </span>
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
            <GuideCell initials={payout.guideInitials} name={payout.guideName} sub="" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12, marginTop: 12 }}>
              <InfoRow label="Tours" value={String(payout.tours)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <StatusBadge status={payout.status === 'paid' ? 'completed' : 'pending'} />
              </div>
            </div>
          </AppCard>

          <AppCard title="Bank Reference">
            <FormGrid>
              <FormInput label="Transfer ID" placeholder="TRF-2026-04-001" />
              <FormTextarea label="Note" placeholder="Optional…" rows={3} style={{ minHeight: 60 }} />
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
