export interface DashboardHeader {
  greeting?: string;
  userName?: string;
  currentDate?: string;
  toursToday?: number;
  unfilledSlots?: number;
  pendingApplications?: number;
  pendingPayoutRequests?: number;
}

export interface DashboardStats {
  toursToday?: number;
  totalSlots?: number;
  unfilledSlots?: number;
  pendingApplications?: number;
  pendingPayouts?: number;
  activeGuides?: number;
}

export interface DashboardTodayTour {
  slotId?: number;
  tourName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  guideName?: string;
  language?: string;
}

export interface DashboardTodaySchedule {
  totalTours?: number;
  tours?: DashboardTodayTour[];
}

export interface DashboardGuideStatus {
  onlineGuides?: number;
  totalActiveGuides?: number;
}

export interface DashboardPayout {
  pendingAmount?: number;
  paidThisMonth?: number;
  pendingCount?: number;
}

export interface DashboardLanguageStat {
  language?: string;
  tours?: number;
}

export interface DashboardWeekDay {
  date?: string;
  tours?: number;
}

export interface DashboardActivityItem {
  title?: string;
  description?: string;
  createdOn?: string;
}

export interface DashboardQuickActions {
  pendingApplications?: number;
  pendingPayouts?: number;
  pendingGuideApprovals?: number;
}

export interface AdminDashboardData {
  header?: DashboardHeader;
  stats?: DashboardStats;
  todaySchedule?: DashboardTodaySchedule;
  guideStatus?: DashboardGuideStatus;
  payout?: DashboardPayout;
  languageDistribution?: { languages?: DashboardLanguageStat[] };
  week?: { days?: DashboardWeekDay[] };
  activity?: { activities?: DashboardActivityItem[] };
  quickActions?: DashboardQuickActions;
}
