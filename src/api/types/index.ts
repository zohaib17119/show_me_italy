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
  tickets?: string | null;
  isCancel?: boolean;
  createdByAdminId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  applicationID?: number | null;
  guideID?: string | null;
  fullName?: string | null;
}

export interface AdminUpdateGuideOnSelectedTourPayload {
  status: string;
  guideId: string;
  tourSlotId: number;
  isNone: boolean;
  applicationId: number;
}

export interface BulkTourSlotCreatePayload {
  tourTypeId: number;
  slotDate: string[];
  languageIds: number[];
  startTime: string;
  endTime: string;
  guidesNeeded: number;
  guestCount: number;
  payRatePerHour: number;
  meetingPoint: string;
  adminNotes: string;
  status: string;
  tickets?: string | null;
  isImported: false;
  conflictFlag: false;
}

export interface TourSlotFilter {
  startDate?: string | null;
  endDate?: string | null;
  languageIds?: string | null;
  tourTypeId?: number | null;
  tourTypeIds?: string | null;
}

export interface CalendarDaySummaryRecord {
  slotDate?: string;
  totalTours?: number;
  amTours?: number;
  pmTours?: number;
  tourStartTime?: string;
  tourEndTime?: string;
  assignedGuides?: number;
  missingSlots?: number;
}

export interface ApplicationCalendarDayRecord {
  slotDate?: string;
  pendingCount?: number;
  applicationCount?: number;
}

export interface TourTypeImagePayload {
  id: number;
  tourTypeImage?: string;
}

export interface TourTypeImageRecord {
  id?: number;
  tourTypeImage?: string | null;
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
  tourTypeImage?: TourTypeImageRecord[] | TourTypeImagePayload[] | string[];
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
  scheduledAt?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  sentAt: string;
}

export interface AnnouncementNotification extends CreateNotificationPayload {
  isRead?: boolean;
}

export interface NotificationRecipientRecord {
  notificationRecipientId?: number;
  notificationId?: string;
  guideId?: string;
  title?: string;
  message?: string;
  notificationType?: string;
  isRead?: boolean;
  readDate?: string | null;
  scheduledAt?: string | null;
  fullName?: string;
  email?: string;
  recipientStatus?: string;
  notificationStatus?: string;
  audience?: string | null;
  channels?: string | null;
  url?: string | null;
}

export interface AgentUserLanguage {
  id?: number;
  languageId?: number;
  code?: string;
  name?: string;
  colorHex?: string;
  rateModifier?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface AgentRecord {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profilePicture?: string | null;
  tourGuideLicenseOrCertificationNo?: string;
  languagesYouSpeak?: string | string[];
  languagesYouSpeakCode?: string;
  userlanguages?: AgentUserLanguage[];
  isVerified?: boolean;
  isActive?: boolean;
  status?: string;
  certificateUpload?: string;
  reasonOfRejection?: string;
  favorite?: boolean;
  adminNotes?: string;
  rating?: number;
  cancellationPercentage?: number;
  totalTour?: number;
  totalEarning?: number;
  pendingCounts?: number;
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

export interface GuideUpdateProfilePayload {
  userId: string;
  favorite: boolean;
  adminNotes: string;
  rating: number;
}

export interface GuideSlotRecord {
  tourSlotID?: number;
  typeName?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  entranceTime?: string;
  guideName?: string;
  fullName?: string;
  totalPAX?: number;
  tickets?: string;
  code?: string;
  tourcode?: string;
  totalApplicants?: number;
  guidesNeeded?: number;
  adminNotes?: string;
  [key: string]: unknown;
}

export interface SlotSummaryRecord {
  tourSlotId?: number;
  tourTypeId?: number;
  languageID?: number;
  meetingPoint?: string | null;
  adminNotes?: string | null;
  tourCode?: string | null;
  languageName?: string | null;
  languageCode?: string | null;
  tourTypeName?: string | null;
  slotDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  guidesNeeded?: number;
  guidesFilled?: number;
  openingsCount?: number;
  guestCount?: number;
  payRatePerHour?: number | null;
  status?: string | null;
  tickets?: string | null;
  /** Legacy fallbacks */
  tour?: string;
  date?: string;
  language?: string;
  payRate?: number;
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
  tourSlotID?: number;
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
  adminNotes?: string | null;
  [key: string]: unknown;
}

export interface NestedGuideApplicationRecord {
  tourSlotID?: number;
  fullName?: string;
  adminNotes?: string;
  typeName?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  code?: string;
  status?: string;
  payRateSnapshot?: number;
  appliedAt?: string;
  applicationID?: number;
  [key: string]: unknown;
}

export interface PendingTourSlotRecord {
  tourSlotId?: number;
  tourTypeId?: number;
  tourTypeName?: string | null;
  typeName?: string | null;
  tourCode?: string | null;
  tourcode?: string | null;
  meetingPoint?: string | null;
  adminNotes?: string | null;
  languageId?: number;
  languageName?: string | null;
  languageCode?: string | null;
  code?: string | null;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  guidesNeeded?: number;
  guidesFilled?: number;
  openingsCount?: number;
  guestCount?: number;
  payRatePerHour?: number;
  status?: string | null;
  isImported?: boolean;
  createdAt?: string;
  guideApplicationResponse?: NestedGuideApplicationRecord[];
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
  slotDate?: string;
  startTime?: string;
  tourTypeName?: string;
  code?: string;
  [key: string]: unknown;
}

export interface AgentProfileResponse {
  userResponse: AgentRecord;
  guideApplication?: GuideApplicationRecord[];
  pendingGuideApplication?: GuideApplicationRecord[];
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
