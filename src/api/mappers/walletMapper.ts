import type { WalletTransaction } from '@/api/types';
import type { PayoutRequest, PayoutStatus } from '@/mocks/payouts';

function mapPayoutStatus(status?: string): PayoutStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('paid') || raw.includes('complete')) return 'paid';
  if (raw.includes('revision')) return 'revision';
  if (raw.includes('den') || raw.includes('reject')) return 'denied';
  return 'pending';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function mapWalletTransaction(record: WalletTransaction, index: number): PayoutRequest {
  const guideName = record.guideName ?? 'Unknown';
  return {
    id: String(record.id ?? index),
    guideId: String(record.guideId ?? index),
    guideName,
    guideInitials: initials(guideName),
    month: record.monthLabel ?? '—',
    monthLabel: record.monthLabel ?? '—',
    tours: Number(record.tours ?? 0),
    amount: Number(record.amount ?? 0),
    submittedAt: record.submittedAt ?? '—',
    status: mapPayoutStatus(record.status),
  };
}

export function mapWalletTransactions(records: WalletTransaction[]): PayoutRequest[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapWalletTransaction);
}

export function computePayoutSummary(transactions: PayoutRequest[]) {
  const pending = transactions.filter((t) => t.status === 'pending' || t.status === 'revision');
  const paid = transactions.filter((t) => t.status === 'paid');
  return {
    totalPending: pending.reduce((sum, t) => sum + t.amount, 0),
    paidThisMonth: paid.reduce((sum, t) => sum + t.amount, 0),
    queueCount: pending.length,
    revisionNeeded: transactions.filter((t) => t.status === 'revision').length,
  };
}
