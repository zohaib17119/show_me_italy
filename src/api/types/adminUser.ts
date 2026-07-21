export interface AdminUserRecord {
  id?: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  country?: string | null;
  city?: string | null;
  tourGuideLicenseOrCertificationNo?: string | null;
  isVerified?: boolean | null;
  certificateUpload?: string | null;
  languagesYouSpeak?: string | null;
  languagesYouSpeakCode?: string | null;
  message?: string | null;
  isAuthenticated?: boolean | null;
  isActive?: boolean | null;
  isDelete?: boolean | null;
  favorite?: unknown | null;
  adminNotes?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  cancellationPercentage?: number | string | null;
  totalTour?: number | string | null;
  totalEarning?: number | string | null;
  userlanguages?: unknown[] | null;
  rating?: number | string | null;
  pendingCounts?: number | string | null;
  [key: string]: unknown;
}
