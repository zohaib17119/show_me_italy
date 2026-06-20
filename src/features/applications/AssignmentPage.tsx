import type { CSSProperties } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  FormInput,
  GuideCell,
  SectionTitle,
  showToast,
  StatusBadge,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';

export function AssignmentPage() {
  const meta = getRouteMeta(ROUTES.ASSIGNMENT);

  return (
    <div>
      <PageHeader title={meta.title} subtitle={meta.subtitle} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppCard
            title="Applicants"
            extra={
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--orange-bg)',
                  color: 'var(--orange)',
                }}
              >
                1 / 2 filled
              </span>
            }
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                background: 'var(--g50)',
                borderRadius: 12,
                border: '1.5px solid var(--g200)',
              }}
            >
              <GuideCell
                initials="MR"
                name="Marco Rossi"
                sub="87 tours · ⭐ 4.9 · EN, FR"
              />
              <StatusBadge status="pending" />
              <AppButton variant="primary" onClick={() => showToast('✓ Marco assigned!')}>
                Assign
              </AppButton>
              <AppButton variant="danger" onClick={() => showToast('Application denied')}>
                Deny
              </AppButton>
            </div>
          </AppCard>

          <AppCard>
            <SectionTitle style={{ marginBottom: 10 }}>Manual Override</SectionTitle>
            <FormInput label="Search Any Guide" placeholder="Type guide name…" />
            <div
              style={{
                marginTop: 10,
                background: 'var(--orange-bg)',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 11,
                color: 'var(--text-secondary)',
                border: '1px solid color-mix(in srgb, var(--orange) 20%, transparent)',
              }}
            >
              ⚠ Override assigns without application — guide will be notified.
            </div>
          </AppCard>
        </div>

        <AppCard title="Slot Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 }}>
            <SummaryRow label="Tour" value="Colosseum Arena" />
            <SummaryRow label="Date" value="Friday, 17 Apr" />
            <SummaryRow label="Language" value="🇬🇧 English" />
            <SummaryRow label="Filled" value="1 / 2" valueStyle={{ color: 'var(--orange)', fontWeight: 700 }} />
            <SummaryRow label="Pay Rate" value="€70.00" valueStyle={{ color: 'var(--g600)', fontWeight: 700 }} />
            <div style={{ height: 1, background: 'var(--border-color)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <StatusBadge status="pending" />
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

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
