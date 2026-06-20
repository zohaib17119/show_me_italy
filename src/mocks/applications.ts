import type { LangCode, TourStatus } from '@/types';

export interface Application {
  id: string;
  guideId: string;
  guideName: string;
  guideInitials: string;
  tour: string;
  date: string;
  dateLabel: string;
  time: string;
  language: LangCode;
  appliedAt: string;
  status: TourStatus;
}

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    guideId: 'guide-marco-rossi',
    guideName: 'Marco Rossi',
    guideInitials: 'MR',
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'EN',
    appliedAt: '2h ago',
    status: 'pending',
  },
  {
    id: 'app-002',
    guideId: 'guide-sofia-conti',
    guideName: 'Sofia Conti',
    guideInitials: 'SC',
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'IT',
    appliedAt: '3h ago',
    status: 'pending',
  },
  {
    id: 'app-003',
    guideId: 'guide-yuki-tanaka',
    guideName: 'Yuki Tanaka',
    guideInitials: 'YT',
    tour: 'Vatican Museums',
    date: '2026-04-19',
    dateLabel: 'Sun 19 Apr',
    time: '09:00–11:30',
    language: 'JA',
    appliedAt: 'Yesterday',
    status: 'approved',
  },
  {
    id: 'app-004',
    guideId: 'guide-hans-muller',
    guideName: 'Hans Müller',
    guideInitials: 'HM',
    tour: 'Colosseum Arena',
    date: '2026-04-17',
    dateLabel: 'Fri 17 Apr',
    time: '10:00–12:30',
    language: 'DE',
    appliedAt: '5h ago',
    status: 'pending',
  },
  {
    id: 'app-005',
    guideId: 'guide-amelie-dubois',
    guideName: 'Amélie Dubois',
    guideInitials: 'AD',
    tour: 'Colosseum Arena',
    date: '2026-04-18',
    dateLabel: 'Sat 18 Apr',
    time: '14:00–16:30',
    language: 'FR',
    appliedAt: '6h ago',
    status: 'pending',
  },
];

export const PENDING_APPLICATIONS_COUNT = 12;
