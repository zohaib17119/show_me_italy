import type { LangCode } from '@/types';

export type PayoutStatus = 'pending' | 'revision' | 'paid' | 'denied';

export interface PayoutRequest {
  id: string;
  guideId: string;
  guideName: string;
  guideInitials: string;
  month: string;
  monthLabel: string;
  tours: number;
  amount: number;
  submittedAt: string;
  status: PayoutStatus;
}

export interface PayoutBreakdownRow {
  id: string;
  day: number;
  month: string;
  tour: string;
  language: LangCode;
  hours: number;
  hourlyRate: number;
  amount: number;
}

export interface PaymentReport {
  id: string;
  guideId: string;
  guideName: string;
  guideInitials: string;
  month: string;
  monthLabel: string;
  tours: number;
  amount: number;
  languages: LangCode[];
  datePaid: string;
  transferId: string;
  status: 'paid';
}

export interface PayoutSummary {
  totalPending: number;
  paidThisMonth: number;
  queueCount: number;
  revisionNeeded: number;
  paidThisYear: number;
  outstanding: number;
  guidesPaid: number;
}

export const PAYOUT_SUMMARY: PayoutSummary = {
  totalPending: 4230,
  paidThisMonth: 12800,
  queueCount: 7,
  revisionNeeded: 2,
  paidThisYear: 68400,
  outstanding: 4230,
  guidesPaid: 32,
};

export const MOCK_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'payout-mr-mar-2026',
    guideId: 'guide-marco-rossi',
    guideName: 'Marco Rossi',
    guideInitials: 'MR',
    month: '2026-03',
    monthLabel: 'March 2026',
    tours: 12,
    amount: 840,
    submittedAt: 'Apr 14',
    status: 'pending',
  },
  {
    id: 'payout-sc-mar-2026',
    guideId: 'guide-sofia-conti',
    guideName: 'Sofia Conti',
    guideInitials: 'SC',
    month: '2026-03',
    monthLabel: 'March 2026',
    tours: 8,
    amount: 640,
    submittedAt: 'Apr 14',
    status: 'pending',
  },
  {
    id: 'payout-hm-mar-2026',
    guideId: 'guide-hans-muller',
    guideName: 'Hans Müller',
    guideInitials: 'HM',
    month: '2026-03',
    monthLabel: 'March 2026',
    tours: 6,
    amount: 420,
    submittedAt: 'Apr 13',
    status: 'revision',
  },
  {
    id: 'payout-ad-mar-2026',
    guideId: 'guide-amelie-dubois',
    guideName: 'Amélie Dubois',
    guideInitials: 'AD',
    month: '2026-03',
    monthLabel: 'March 2026',
    tours: 5,
    amount: 375,
    submittedAt: 'Apr 12',
    status: 'pending',
  },
];

export const MOCK_PAYOUT_BREAKDOWN: PayoutBreakdownRow[] = [
  {
    id: 'pb-001',
    day: 30,
    month: 'Mar',
    tour: 'Colosseum Arena Tour',
    language: 'EN',
    hours: 2.5,
    hourlyRate: 28,
    amount: 70,
  },
  {
    id: 'pb-002',
    day: 25,
    month: 'Mar',
    tour: 'Colosseum Arena Tour',
    language: 'FR',
    hours: 2.5,
    hourlyRate: 30,
    amount: 75,
  },
];

export const MOCK_PAYOUT_DETAIL = {
  payoutId: 'payout-mr-mar-2026',
  guideId: 'guide-marco-rossi',
  guideName: 'Marco Rossi',
  guideInitials: 'MR',
  guideEmail: 'marco@email.com',
  monthLabel: 'March 2026',
  submittedAt: '14 Apr 2026',
  tours: 12,
  hours: 30,
  netPayout: 840,
  status: 'pending' as PayoutStatus,
  breakdown: MOCK_PAYOUT_BREAKDOWN,
};

export const MOCK_PAYMENT_REPORTS: PaymentReport[] = [
  {
    id: 'report-mr-feb-2026',
    guideId: 'guide-marco-rossi',
    guideName: 'Marco Rossi',
    guideInitials: 'MR',
    month: '2026-02',
    monthLabel: 'Feb 2026',
    tours: 10,
    amount: 700,
    languages: ['EN', 'FR'],
    datePaid: 'Mar 5, 2026',
    transferId: 'TRF-2026-03-004',
    status: 'paid',
  },
  {
    id: 'report-sc-feb-2026',
    guideId: 'guide-sofia-conti',
    guideName: 'Sofia Conti',
    guideInitials: 'SC',
    month: '2026-02',
    monthLabel: 'Feb 2026',
    tours: 7,
    amount: 560,
    languages: ['IT'],
    datePaid: 'Mar 5, 2026',
    transferId: 'TRF-2026-03-005',
    status: 'paid',
  },
  {
    id: 'report-hm-feb-2026',
    guideId: 'guide-hans-muller',
    guideName: 'Hans Müller',
    guideInitials: 'HM',
    month: '2026-02',
    monthLabel: 'Feb 2026',
    tours: 6,
    amount: 450,
    languages: ['DE'],
    datePaid: 'Mar 5, 2026',
    transferId: 'TRF-2026-03-006',
    status: 'paid',
  },
];
