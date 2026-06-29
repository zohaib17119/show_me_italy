export type { ApiResponse } from './apiResponse';
export { unwrapData } from './apiResponse';
export type {
  AdminDashboardData,
  DashboardActivityItem,
  DashboardHeader,
  DashboardLanguageStat,
  DashboardPayout,
  DashboardQuickActions,
  DashboardStats,
  DashboardTodaySchedule,
  DashboardTodayTour,
  DashboardWeekDay,
} from './dashboard';

export interface TimeSpan {
  ticks?: number;
}

export interface TourSlot {
  tourSlotId?: number;
  tourTypeId: number;
  meetingPoint?: string | null;
  adminNotes?: string | null;
  languageId: number;
  languageName?: string;
  tourImages?: string[];
  latitude?: number;
  longitude?: number;
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

export interface TourSlotFilter {
  startDate?: string | null;
  endDate?: string | null;
  languageIds?: string | null;
  tourTypeId?: number | null;
  tourTypeIds?: string | null;
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

export interface CreateNotificationPayload {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  audience: string;
  channels: string;
  scheduledAt: string;
  status: string;
  createdBy: string;
  createdAt: string;
  sentAt: string;
}

export interface AnnouncementNotification extends CreateNotificationPayload {
  isRead?: boolean;
}

export interface AgentRecord {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  tourGuideLicenseOrCertificationNo?: string;
  languagesYouSpeak?: string | string[];
  languagesYouSpeakCode?: string;
  isVerified?: boolean;
  isActive?: boolean;
  status?: string;
  certificateUpload?: string;
  reasonOfRejection?: string;
  [key: string]: unknown;
}

export interface AllAgentsAdminFilter {
  userId?: string | null;
  isActive?: boolean | null;
  email?: string | null;
  phoneNumber?: string | null;
  language?: string | null;
}

export interface ApproveRejectAgents {
  userId?: string | null;
  isActive?: boolean | null;
  reasonOfRejection?: string | null;
}

export interface GuideSlotRecord {
  tourSlotID?: number;
  typeName?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  code?: string;
  totalApplicants?: number;
  guidesNeeded?: number;
  [key: string]: unknown;
}

export interface SlotSummaryRecord {
  tour?: string;
  date?: string;
  language?: string;
  guidesFilled?: number;
  guidesNeeded?: number;
  payRate?: number;
  status?: string;
  [key: string]: unknown;
}

export interface GuideSlotApplicantsResponse {
  slotSummary?: SlotSummaryRecord;
  applicants?: SlotApplicantRecord[];
}

export interface AvailableGuideRecord {
  id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  tourGuideLicenseOrCertificationNo?: string;
  languagesYouSpeak?: string;
  languagesYouSpeakCode?: string;
  isActive?: boolean;
  isVerified?: boolean;
  [key: string]: unknown;
}

export interface AssignGuideApplicationPayload {
  applicationId: number;
  guideId: string;
  tourSlotId: number;
  status: 'Approved';
  payRateSnapshot: number;
  slotAssignmentId: number;
  appliedAt: string;
  updatedAt: string;
}

export interface SlotApplicantRecord {
  tourSlotID?: number;
  id?: string;
  applicationID?: number;
  applicationId?: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  languagesYouSpeak?: string;
  languagesYouSpeakCode?: string;
  status?: string;
  appliedAt?: string;
  [key: string]: unknown;
}

export interface AgentApplication {
  id?: string | number;
  applicationId?: number;
  applicationID?: number;
  agentId?: string;
  guideId?: string;
  tourSlotId?: number;
  fullName?: string;
  typeName?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  code?: string;
  guideName?: string;
  guideEmail?: string;
  tour?: string;
  dateLabel?: string;
  time?: string;
  language?: string;
  appliedAt?: string;
  status?: string;
  payRateSnapshot?: number;
  [key: string]: unknown;
}

export interface GuideApplicationRecord {
  applicationId?: number;
  guideId?: string;
  tourSlotId?: number;
  status?: string;
  payRateSnapshot?: number;
  slotAssignmentId?: number;
  appliedAt?: string;
  withdrawnAt?: string | null;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface AgentProfileResponse {
  userResponse: AgentRecord;
  guideApplication?: GuideApplicationRecord[];
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
