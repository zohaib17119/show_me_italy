export type { ApiResponse } from './apiResponse';
export { unwrapData } from './apiResponse';

export interface TimeSpan {
  ticks?: number;
}

export interface TourSlot {
  tourSlotId?: number;
  tourTypeId: number;
  meetingPoint?: string | null;
  adminNotes?: string | null;
  languageId: number;
  slotDate: string;
  startTime?: TimeSpan | string;
  endTime?: TimeSpan | string;
  guidesNeeded: number;
  guidesFilled?: number;
  openingsCount?: number;
  guestCount?: number | null;
  payRatePerHour?: number | null;
  status?: string | null;
  isImported?: boolean;
  externalRef?: string | null;
  conflictFlag?: boolean;
  createdByAdminId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourType {
  tourTypeId?: number;
  name?: string | null;
  description?: string | null;
  location?: string | null;
  meetingPointName?: string | null;
  meetingPointAddress?: string | null;
  basePrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Language {
  languageId?: number;
  code?: string | null;
  name?: string | null;
  colorHex?: string | null;
  rateModifier?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface NotificationsDto {
  id?: number;
  title?: string | null;
  description?: string | null;
  userId?: string | null;
  recordId?: number;
  type?: number;
  icon?: string | null;
  redirectUrl?: string | null;
  filePath?: string | null;
  isRead?: boolean;
  time?: string | null;
  createdOn?: string;
}

export interface AgentRecord {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  tourGuideLicenseOrCertificationNo?: string;
  languagesYouSpeak?: string[];
  isVerified?: boolean;
  status?: string;
  certificateUpload?: string;
  [key: string]: unknown;
}

export interface AgentApplication {
  id?: string | number;
  agentId?: string;
  tourSlotId?: number;
  guideName?: string;
  guideEmail?: string;
  tour?: string;
  dateLabel?: string;
  time?: string;
  language?: string;
  appliedAt?: string;
  status?: string;
  [key: string]: unknown;
}

export interface WalletTransaction {
  id?: string | number;
  guideId?: string;
  guideName?: string;
  amount?: number;
  status?: string;
  monthLabel?: string;
  tours?: number;
  submittedAt?: string;
  [key: string]: unknown;
}

export interface WalletBalance {
  balance?: number;
  pending?: number;
  [key: string]: unknown;
}
