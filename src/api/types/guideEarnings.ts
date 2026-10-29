export interface GuideEarningsRecord {
  guideID?: string;
  firstName?: string | null;
  lastName?: string | null;
  guideName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  totalTours?: number;
  totalEarnings?: number;
  averagePayRate?: number;
  minimumPayRate?: number;
  maximumPayRate?: number;
  firstTourDate?: string | null;
  lastTourDate?: string | null;
  languagesWorked?: number;
  tourTypesWorked?: number;
  totalMinutes?: number;
  totalHours?: number;
  averageHourlyEarning?: number;
  [key: string]: unknown;
}

export interface GetGuideEarningsParams {
  guideId?: string;
  fromDate: string;
  toDate: string;
  pagenumber: number;
  pagesize: number;
}

export interface GetGuideEarningsDetailParams {
  guideId: string;
  fromDate: string;
  toDate: string;
}

export interface GuideEarningsDetailRecord {
  guideID?: string;
  guideName?: string | null;
  applicationID?: number;
  tourSlotID?: number;
  slotDate?: string | null;
  tourTypeID?: number;
  tourTypeName?: string | null;
  languageID?: number;
  earning?: number;
  durationMinutes?: number;
  hours?: number;
}
