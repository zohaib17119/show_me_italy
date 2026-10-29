import type { LangCode, TourStatus } from '@/types';

export type GuideStatus = 'active' | 'pending' | 'inactive';

export interface GuideEarnings {
  totalPaid: number;
  pending: number;
  totalTours: number;
}

export interface GuideTourHistory {
  date: string;
  tour: string;
  language: LangCode;
  hours: number;
  amount: number;
  status: TourStatus | 'paid';
}

export interface Guide {
  id: string;
  name: string;
  email: string;
  initials: string;
  languages: LangCode[];
  status: GuideStatus;
  certified: boolean;
  isActive?: boolean;
  tours: number;
  rating: number | null;
  cancellationPercentage?: number | null;
  license: string;
  phone: string;
  activeSince: string;
  earnings: GuideEarnings;
  tourHistory: GuideTourHistory[];
  adminNote: string;
  adminNotes?: string;
  favorite?: boolean;
  certificateUpload?: string;
  profilePicture?: string | null;
  pendingCounts?: number;
  guideCategory?: number[];
  categories?: string;
}

export const MOCK_GUIDES: Guide[] = [
  {
    id: 'guide-marco-rossi',
    name: 'Marco Rossi',
    email: 'marco.rossi@email.com',
    initials: 'MR',
    languages: ['EN', 'FR'],
    status: 'active',
    certified: true,
    tours: 87,
    rating: 4.9,
    license: 'IT-TG-2024-00847',
    phone: '+39 06 1234 5678',
    activeSince: 'Jan 2024',
    earnings: { totalPaid: 5840, pending: 840, totalTours: 87 },
    tourHistory: [
      {
        date: '14 Apr',
        tour: 'Colosseum Arena',
        language: 'EN',
        hours: 2.5,
        amount: 70,
        status: 'pending',
      },
      {
        date: '12 Apr',
        tour: 'Colosseum Arena',
        language: 'FR',
        hours: 2.5,
        amount: 75,
        status: 'paid',
      },
    ],
    adminNote: 'Reliable senior guide. Preferred for English and French VIP groups.',
  },
  {
    id: 'guide-sofia-conti',
    name: 'Sofia Conti',
    email: 'sofia@email.com',
    initials: 'SC',
    languages: ['IT', 'ES'],
    status: 'active',
    certified: true,
    tours: 64,
    rating: 4.7,
    license: 'IT-TG-2023-00612',
    phone: '+39 06 9876 5432',
    activeSince: 'Mar 2023',
    earnings: { totalPaid: 4120, pending: 640, totalTours: 64 },
    tourHistory: [
      {
        date: '14 Apr',
        tour: 'Colosseum Arena',
        language: 'IT',
        hours: 2.5,
        amount: 70,
        status: 'confirmed',
      },
    ],
    adminNote: 'Strong Italian native speaker. Handles large groups well.',
  },
  {
    id: 'guide-yuki-tanaka',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@email.com',
    initials: 'YT',
    languages: ['JA', 'EN'],
    status: 'pending',
    certified: false,
    tours: 0,
    rating: null,
    license: 'JP-TG-2024-00219',
    phone: '+81 90 1234 5678',
    activeSince: 'Apr 2026',
    earnings: { totalPaid: 0, pending: 0, totalTours: 0 },
    tourHistory: [],
    adminNote: 'Awaiting document verification. Registered 14 Apr 2026.',
  },
  {
    id: 'guide-hans-muller',
    name: 'Hans Müller',
    email: 'hans@email.com',
    initials: 'HM',
    languages: ['DE'],
    status: 'active',
    certified: true,
    tours: 42,
    rating: 4.8,
    license: 'DE-TG-2022-00391',
    phone: '+49 30 1234 5678',
    activeSince: 'Sep 2022',
    earnings: { totalPaid: 2940, pending: 420, totalTours: 42 },
    tourHistory: [
      {
        date: '13 Apr',
        tour: 'Colosseum Arena',
        language: 'DE',
        hours: 2.5,
        amount: 75,
        status: 'completed',
      },
    ],
    adminNote: 'Payout revision requested for March 2026 — verify tour hours.',
  },
  {
    id: 'guide-carlos-silva',
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    initials: 'CS',
    languages: ['PT', 'ES'],
    status: 'pending',
    certified: false,
    tours: 0,
    rating: null,
    license: 'PT-TG-2023-00445',
    phone: '+351 91 234 5678',
    activeSince: 'Apr 2026',
    earnings: { totalPaid: 0, pending: 0, totalTours: 0 },
    tourHistory: [],
    adminNote: 'New applicant. Portuguese and Spanish speaker from Lisbon.',
  },
  {
    id: 'guide-amelie-dubois',
    name: 'Amélie Dubois',
    email: 'amelie.dubois@email.com',
    initials: 'AD',
    languages: ['FR'],
    status: 'active',
    certified: true,
    tours: 38,
    rating: 4.6,
    license: 'FR-TG-2023-00788',
    phone: '+33 6 12 34 56 78',
    activeSince: 'Jun 2023',
    earnings: { totalPaid: 2660, pending: 150, totalTours: 38 },
    tourHistory: [
      {
        date: '14 Apr',
        tour: 'Colosseum Arena',
        language: 'FR',
        hours: 2.5,
        amount: 75,
        status: 'confirmed',
      },
      {
        date: '9 Apr',
        tour: 'Colosseum Arena',
        language: 'FR',
        hours: 2.5,
        amount: 75,
        status: 'paid',
      },
    ],
    adminNote: 'Consistently high ratings for French-language tours.',
  },
  {
    id: 'guide-li-wei',
    name: 'Li Wei',
    email: 'li.wei@email.com',
    initials: 'LW',
    languages: ['ZH', 'EN'],
    status: 'pending',
    certified: false,
    tours: 0,
    rating: null,
    license: 'CN-TG-2025-00112',
    phone: '+86 138 0000 1234',
    activeSince: 'Apr 2026',
    earnings: { totalPaid: 0, pending: 0, totalTours: 0 },
    tourHistory: [],
    adminNote: 'Registered 12 Apr 2026. Chinese and English bilingual.',
  },
];

export function getGuideById(id: string): Guide | undefined {
  return MOCK_GUIDES.find((g) => g.id === id);
}
