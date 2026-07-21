import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  DataTable,
  LangChip,
  LockedAction,
  SectionTitle,
  ToggleRow,
  showToast,
} from '@/components/ui';
import { useCan } from '@/features/auth/useCan';
import { ROUTES } from '@/constants/routes';
import type { LangCode } from '@/types';
import styles from './schedule.module.css';

interface ImportRow {
  key: string;
  date: string;
  tour: string;
  language: LangCode;
  guests: number;
  status: 'new' | 'conflict';
}

const IMPORT_ROWS: ImportRow[] = [
  {
    key: '1',
    date: 'Fri 17 Apr',
    tour: 'Colosseum Arena',
    language: 'EN',
    guests: 18,
    status: 'new',
  },
  {
    key: '2',
    date: 'Fri 17 Apr',
    tour: 'Colosseum Arena',
    language: 'IT',
    guests: 22,
    status: 'conflict',
  },
  {
    key: '3',
    date: 'Sat 18 Apr',
    tour: 'Pantheon Tour',
    language: 'FR',
    guests: 15,
    status: 'new',
  },
];

const SYNC_LOG = [
  { type: 'success' as const, text: '✓ 14 Apr · 09:15 — 4 new slots' },
  { type: 'neutral' as const, text: '14 Apr · 08:45 — No changes' },
  { type: 'warn' as const, text: '⚠ 13 Apr · 23:00 — 1 conflict' },
];

const importColumns: ColumnsType<ImportRow> = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Tour', dataIndex: 'tour', key: 'tour' },
  {
    title: 'Language',
    dataIndex: 'language',
    key: 'language',
    render: (lang: LangCode) => <LangChip code={lang} />,
  },
  { title: 'Guests', dataIndex: 'guests', key: 'guests' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: ImportRow['status']) =>
      status === 'new' ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--g50)',
            color: 'var(--g700)',
          }}
        >
          New
        </span>
      ) : (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--orange-bg)',
            color: 'var(--orange)',
          }}
        >
          ⚠ Conflict
        </span>
      ),
  },
];

export function ImportSyncPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canImport = can('Schedule.Import');
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
          { label: 'Import / Sync' },
        ]}
      />

      <PageHeader title="Import from Reservation System" />

      <div className={styles.bulkGrid}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <AppCard>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <SectionTitle style={{ margin: 0 }}>Connection Status</SectionTitle>
              <span className={styles.connectedBadge}>
                <span className={styles.connectedDot} />
                API Connected
              </span>
            </div>
            <ToggleRow
              label="Auto-Sync"
              description="Every 30 minutes"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
            <LockedAction allowed={canImport}>
              <AppButton
                style={{ width: '100%', marginTop: 12 }}
                onClick={() => showToast('🔄 Syncing…')}
              >
                🔄 Sync Now
              </AppButton>
            </LockedAction>
            </AppCard>
          </div>

          <AppCard>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <SectionTitle style={{ margin: 0 }}>Import Preview (3 new)</SectionTitle>
              <div style={{ display: 'flex', gap: 8 }}>
                <AppButton variant="secondary" size="xs">
                  Cancel
                </AppButton>
                <LockedAction allowed={canImport}>
                  <AppButton size="xs" onClick={() => showToast('✓ 2 slots imported.')}>
                    Confirm Import
                  </AppButton>
                </LockedAction>
              </div>
            </div>
            <DataTable<ImportRow>
              columns={importColumns}
              dataSource={IMPORT_ROWS}
              pagination={false}
              size="small"
            />
          </AppCard>
        </div>

        <AppCard>
          <SectionTitle style={{ marginBottom: 12 }}>Sync Log</SectionTitle>
          <div className={styles.syncLogList}>
            {SYNC_LOG.map((entry) => (
              <div
                key={entry.text}
                className={[
                  styles.syncLogItem,
                  entry.type === 'success'
                    ? styles.syncLogSuccess
                    : entry.type === 'warn'
                      ? styles.syncLogWarn
                      : styles.syncLogNeutral,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {entry.text}
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  );
}
