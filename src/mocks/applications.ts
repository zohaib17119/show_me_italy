import type { LangCode, TourStatus } from '@/types';

export interface Application {
  id: string;
  applicationId: number;
  guideId: string;
  guideName: string;
  guideInitials: string;
  tourSlotId: number | null;
  tour: string;
  date: string;
  dateLabel: string;
  time: string;
  language: LangCode;
  payRate: string;
  adminNotes: string;
  appliedAt: string;
  status: TourStatus;
}

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    applicationId: 1,
    guideId: 'guide-marco-rossi',
    guideName: 'Marco Rossi',
    guideInitials: 'MR',
    tourSlotId: 101,
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'EN',
    payRate: '€70',
    adminNotes: '',
    appliedAt: '2h ago',
    status: 'pending',
  },
  {
    id: 'app-002',
    applicationId: 2,
    guideId: 'guide-sofia-conti',
    guideName: 'Sofia Conti',
    guideInitials: 'SC',
    tourSlotId: 101,
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'IT',
    payRate: '€70',
    adminNotes: '',
    appliedAt: '3h ago',
    status: 'pending',
  },
  {
    id: 'app-003',
    applicationId: 3,
    guideId: 'guide-yuki-tanaka',
    guideName: 'Yuki Tanaka',
    guideInitials: 'YT',
    tourSlotId: 102,
    tour: 'Vatican Museums',
    date: '2026-04-19',
    dateLabel: 'Sun 19 Apr',
    time: '09:00–11:30',
    language: 'JA',
    payRate: '€65',
    adminNotes: '',
    appliedAt: 'Yesterday',
    status: 'approved',
  },
  {
    id: 'app-004',
    applicationId: 4,
    guideId: 'guide-hans-muller',
    guideName: 'Hans Müller',
    guideInitials: 'HM',
    tourSlotId: 101,
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'DE',
    payRate: '€70',
    adminNotes: '',
    appliedAt: '5h ago',
    status: 'pending',
  },
  {
    id: 'app-005',
    applicationId: 5,
    guideId: 'guide-amelie-dubois',
    guideName: 'Amélie Dubois',
    guideInitials: 'AD',
    tourSlotId: 103,
    tour: 'Colosseum Arena',
    date: '2026-04-18',
    dateLabel: 'Sat 18 Apr',
    time: '14:00–16:30',
    language: 'FR',
    payRate: '€70',
    adminNotes: '',
    appliedAt: '6h ago',
    status: 'pending',
  },
];

export const PENDING_APPLICATIONS_COUNT = 12;
