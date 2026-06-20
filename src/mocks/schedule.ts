import type { LangCode, TourStatus } from '@/types';

export const MOCK_TODAY = '2026-04-14';

export interface CalendarEvent {
  id: string;
  date: string;
  language: LangCode;
  label: string;
  guideId?: string;
  guideName?: string;
  unfilled?: boolean;
}

export interface TodayScheduleItem {
  id: string;
  time: string;
  tour: string;
  language: LangCode;
  guideName?: string;
  guests?: number;
  meetingPoint?: string;
  meta: string;
  status: TourStatus;
  alert?: boolean;
}

export interface BulkPreviewRow {
  id: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  language: LangCode;
  guidesNeeded: number;
  status: 'ready' | 'overlap';
}

/** Calendar events keyed by ISO date (YYYY-MM-DD). */
export const CALENDAR_EVENTS_BY_DATE: Record<string, CalendarEvent[]> = {
  '2026-04-04': [
    { id: 'ev-0404-en', date: '2026-04-04', language: 'EN', label: 'EN · Marco', guideId: 'guide-marco-rossi', guideName: 'Marco Rossi' },
    { id: 'ev-0404-it', date: '2026-04-04', language: 'IT', label: 'IT · Sofia', guideId: 'guide-sofia-conti', guideName: 'Sofia Conti' },
  ],
  '2026-04-09': [
    { id: 'ev-0409-fr', date: '2026-04-09', language: 'FR', label: 'FR · Amélie', guideId: 'guide-amelie-dubois', guideName: 'Amélie Dubois' },
  ],
  '2026-04-14': [
    { id: 'ev-0414-en', date: '2026-04-14', language: 'EN', label: 'EN · Marco', guideId: 'guide-marco-rossi', guideName: 'Marco Rossi' },
    { id: 'ev-0414-it', date: '2026-04-14', language: 'IT', label: 'IT · Sofia', guideId: 'guide-sofia-conti', guideName: 'Sofia Conti' },
    { id: 'ev-0414-fr', date: '2026-04-14', language: 'FR', label: 'FR · Amélie', guideId: 'guide-amelie-dubois', guideName: 'Amélie Dubois' },
    { id: 'ev-0414-es', date: '2026-04-14', language: 'ES', label: 'ES · Open ⚠', unfilled: true },
  ],
  '2026-04-17': [
    { id: 'ev-0417-en', date: '2026-04-17', language: 'EN', label: 'EN · Marco', guideId: 'guide-marco-rossi', guideName: 'Marco Rossi' },
    { id: 'ev-0417-de', date: '2026-04-17', language: 'DE', label: 'DE · Hans', guideId: 'guide-hans-muller', guideName: 'Hans Müller' },
  ],
  '2026-04-21': [
    { id: 'ev-0421-pt', date: '2026-04-21', language: 'PT', label: 'PT · Carlos', guideId: 'guide-carlos-silva', guideName: 'Carlos Silva' },
  ],
  '2026-04-24': [
    { id: 'ev-0424-en', date: '2026-04-24', language: 'EN', label: 'EN · Marco', guideId: 'guide-marco-rossi', guideName: 'Marco Rossi' },
  ],
  '2026-04-28': [
    { id: 'ev-0428-fr', date: '2026-04-28', language: 'FR', label: 'FR · Amélie', guideId: 'guide-amelie-dubois', guideName: 'Amélie Dubois' },
    { id: 'ev-0428-it', date: '2026-04-28', language: 'IT', label: 'IT · Sofia', guideId: 'guide-sofia-conti', guideName: 'Sofia Conti' },
  ],
};

export const TODAY_SCHEDULE: TodayScheduleItem[] = [
  {
    id: 'sched-0900',
    time: '09:00',
    tour: 'Colosseum Arena',
    language: 'EN',
    guideName: 'Marco Rossi',
    guests: 18,
    meetingPoint: 'Basilica Santi Cosma e Damiano',
    meta: 'Marco Rossi · 18 guests · Basilica Santi Cosma e Damiano',
    status: 'confirmed',
  },
  {
    id: 'sched-1030',
    time: '10:30',
    tour: 'Colosseum Arena',
    language: 'IT',
    guideName: 'Sofia Conti',
    guests: 22,
    meta: 'Sofia Conti · 22 guests',
    status: 'confirmed',
  },
  {
    id: 'sched-1300',
    time: '13:00',
    tour: 'Colosseum Arena',
    language: 'FR',
    guideName: 'Amélie Dubois',
    guests: 15,
    meta: 'Amélie Dubois · 15 guests',
    status: 'confirmed',
  },
  {
    id: 'sched-1430',
    time: '14:30',
    tour: 'Colosseum Arena',
    language: 'ES',
    meta: '⚠ No guide assigned — 24h warning',
    status: 'unfilled',
    alert: true,
  },
  {
    id: 'sched-1600',
    time: '16:00',
    tour: 'Colosseum Arena',
    language: 'DE',
    guideName: 'Hans Müller',
    guests: 20,
    meta: 'Hans Müller · 20 guests',
    status: 'pending',
  },
];

export const BULK_PREVIEW_ROWS: BulkPreviewRow[] = [
  {
    id: 'bulk-0420',
    date: '2026-04-20',
    dateLabel: 'Mon 20 Apr',
    startTime: '09:00',
    endTime: '11:30',
    language: 'EN',
    guidesNeeded: 2,
    status: 'ready',
  },
  {
    id: 'bulk-0421',
    date: '2026-04-21',
    dateLabel: 'Tue 21 Apr',
    startTime: '09:00',
    endTime: '11:30',
    language: 'EN',
    guidesNeeded: 2,
    status: 'ready',
  },
  {
    id: 'bulk-0422',
    date: '2026-04-22',
    dateLabel: 'Wed 22 Apr',
    startTime: '09:00',
    endTime: '11:30',
    language: 'EN',
    guidesNeeded: 2,
    status: 'overlap',
  },
];

export const BULK_PREVIEW_MORE_COUNT = 25;
