import type { LangCode } from '@/types';
import { languageColors } from '@/theme/tokens';

export interface TourType {
  id: string;
  name: string;
  rate: number;
  durationHours: number;
  isDefault?: boolean;
  meetingPoint?: string;
}

export interface LanguageSetting {
  code: LangCode;
  name: string;
  hex: string;
  rateLabel: string;
  rateAdjustment?: number;
}

export interface AdminUserSetting {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  status: 'active' | 'inactive';
}

export const MOCK_TOUR_TYPES: TourType[] = [
  {
    id: 'tour-colosseum',
    name: 'Colosseum Arena Tour',
    rate: 70,
    durationHours: 2.5,
    isDefault: true,
    meetingPoint: 'Basilica Santi Cosma e Damiano',
  },
  {
    id: 'tour-pantheon',
    name: 'Pantheon Tour',
    rate: 65,
    durationHours: 2,
    meetingPoint: 'Piazza della Rotonda',
  },
  {
    id: 'tour-vatican',
    name: 'Vatican Museums',
    rate: 95,
    durationHours: 3,
    meetingPoint: 'Viale Vaticano entrance',
  },
];

export const MOCK_LANGUAGE_SETTINGS: LanguageSetting[] = [
  { code: 'EN', name: 'English', hex: languageColors.EN, rateLabel: 'Base' },
  { code: 'IT', name: 'Italian', hex: languageColors.IT, rateLabel: 'Base' },
  { code: 'FR', name: 'French', hex: languageColors.FR, rateLabel: '+€5', rateAdjustment: 5 },
  { code: 'DE', name: 'German', hex: languageColors.DE, rateLabel: '+€10', rateAdjustment: 10 },
  { code: 'ES', name: 'Spanish', hex: languageColors.ES, rateLabel: 'Base' },
  { code: 'PT', name: 'Portuguese', hex: languageColors.PT, rateLabel: '+€5', rateAdjustment: 5 },
  { code: 'JA', name: 'Japanese', hex: languageColors.JA, rateLabel: '+€15', rateAdjustment: 15 },
  { code: 'ZH', name: 'Chinese', hex: languageColors.ZH, rateLabel: '+€15', rateAdjustment: 15 },
];

export const MOCK_ADMIN_USERS: AdminUserSetting[] = [
  {
    id: 'admin-super',
    name: 'Super Admin',
    email: 'admin@showmeitaly.com',
    role: 'Administrator',
    initials: 'SA',
    status: 'active',
  },
  {
    id: 'admin-jane',
    name: 'Jane Doe',
    email: 'jane.doe@showmeitaly.com',
    role: 'Admin',
    initials: 'JD',
    status: 'active',
  },
];
