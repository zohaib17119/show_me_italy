import type { BulkTourSlotCreatePayload, TourSlot, Language, TourType } from '@/api/types';
import { toApiDateTime } from '@/api/utils/date';
import { ticksToTimeString } from '@/api/utils/timeSpan';
import type { LangCode } from '@/types';

function normalizeTimeForApi(time: string): string {
  return time.length <= 5 ? `${time}:00` : time;
}

export interface CalendarEvent {
  id: string;
  date: string;
  label: string;
  language: LangCode;
  unfilled: boolean;
  tourTypeId: number;
  slot: TourSlot;
}

export function slotDateKey(slotDate: string): string {
  return slotDate.slice(0, 10);
}

export function mapTourSlotToCalendarEvent(
  slot: TourSlot,
  tourTypes: TourType[],
  languages: Language[],
): CalendarEvent {
  const tourType = tourTypes.find((t) => t.tourTypeId === slot.tourTypeId);
  const language = languages.find((l) => l.languageId === slot.languageId);
  const langCode = (language?.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;
  const start = ticksToTimeString(slot.startTime);
  const tourName = tourType?.name ?? `Tour #${slot.tourTypeId}`;
  const unfilled = (slot.guidesFilled ?? 0) < slot.guidesNeeded;

  return {
    id: String(slot.tourSlotId ?? `${slot.tourTypeId}-${slot.slotDate}-${start}`),
    date: slotDateKey(slot.slotDate),
    label: `${start} ${tourName}`,
    language: langCode,
    unfilled,
    tourTypeId: slot.tourTypeId,
    slot,
  };
}

export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});
}

export interface TourSlotFormValues {
  tourTypeId: number;
  languageId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  guidesNeeded: number;
  guestCount: number;
  payRatePerHour: number;
  meetingPoint: string;
  adminNotes: string;
  status: string;
  openApplications: boolean;
  sendNotification: boolean;
  tickets?: string | null;
  guidesFilled?: number;
  openingsCount?: number;
  externalRef?: string;
  isImported?: boolean;
  conflictFlag?: boolean;
  languageName?: string;
  tourImages?: string[];
}

export function mapTourSlotToFormValues(slot: TourSlot): TourSlotFormValues {
  const status = slot.status ?? 'Open';
  return {
    tourTypeId: slot.tourTypeId,
    languageId: slot.languageId,
    slotDate: slotDateKey(slot.slotDate),
    startTime: ticksToTimeString(slot.startTime),
    endTime: ticksToTimeString(slot.endTime),
    guidesNeeded: slot.guidesNeeded,
    guestCount: slot.guestCount ?? 0,
    payRatePerHour: slot.payRatePerHour ?? 0,
    meetingPoint: slot.meetingPoint ?? '',
    adminNotes: slot.adminNotes ?? '',
    status,
    openApplications: status.toLowerCase() === 'open',
    sendNotification: false,
    tickets: slot.tickets ?? null,
    guidesFilled: slot.guidesFilled,
    openingsCount: slot.openingsCount,
    externalRef: slot.externalRef ?? undefined,
    isImported: slot.isImported,
    conflictFlag: slot.conflictFlag,
    languageName: slot.languageName,
    tourImages: slot.tourImages,
  };
}

export function buildTourSlotPayload(form: {
  tourTypeId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  languageId: number;
  guidesNeeded: number;
  guestCount: number;
  payRatePerHour: number;
  meetingPoint: string;
  adminNotes: string;
  status: string;
  tickets?: string | null;
}): TourSlot {
  return {
    tourTypeId: form.tourTypeId,
    slotDate: toApiDateTime(form.slotDate),
    startTime: normalizeTimeForApi(form.startTime),
    endTime: normalizeTimeForApi(form.endTime),
    languageId: form.languageId,
    guidesNeeded: form.guidesNeeded,
    guestCount: form.guestCount,
    payRatePerHour: form.payRatePerHour,
    meetingPoint: form.meetingPoint,
    adminNotes: form.adminNotes,
    status: form.status,
    tickets: form.tickets?.trim() ? form.tickets : null,
    isImported: false,
    conflictFlag: false,
  };
}

export function buildBulkTourSlotPayload(form: {
  tourTypeId: number;
  dates: string[];
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
}): BulkTourSlotCreatePayload {
  return {
    tourTypeId: form.tourTypeId,
    slotDate: form.dates.map((date) => toApiDateTime(date)),
    languageIds: form.languageIds,
    startTime: normalizeTimeForApi(form.startTime),
    endTime: normalizeTimeForApi(form.endTime),
    guidesNeeded: form.guidesNeeded,
    guestCount: form.guestCount,
    payRatePerHour: form.payRatePerHour,
    meetingPoint: form.meetingPoint,
    adminNotes: form.adminNotes,
    status: form.status,
    tickets: form.tickets?.trim() ? form.tickets : null,
    isImported: false,
    conflictFlag: false,
  };
}

export function mergeTourSlotForUpdate(
  original: TourSlot,
  form: TourSlotFormValues,
): TourSlot {
  return {
    ...original,
    tourTypeId: form.tourTypeId,
    languageId: form.languageId,
    slotDate: toApiDateTime(form.slotDate),
    startTime: normalizeTimeForApi(form.startTime),
    endTime: normalizeTimeForApi(form.endTime),
    guidesNeeded: form.guidesNeeded,
    guestCount: form.guestCount,
    payRatePerHour: form.payRatePerHour,
    meetingPoint: form.meetingPoint,
    adminNotes: form.adminNotes,
    status: form.status,
    tickets: form.tickets?.trim() ? form.tickets : null,
  };
}

export interface UpdateAssignSlotPayload {
  tourSlotId: number;
  payRatePerHour: number;
  slotDate: string;
  startTime: string;
  endTime: string;
}

export function buildUpdateAssignSlotPayload(form: {
  tourSlotId: number;
  payRatePerHour: number;
  slotDate: string;
  startTime: string;
  endTime: string;
}): UpdateAssignSlotPayload {
  const dateKey = form.slotDate.slice(0, 10);
  return {
    tourSlotId: form.tourSlotId,
    payRatePerHour: form.payRatePerHour,
    slotDate: toApiDateTime(dateKey),
    startTime: normalizeTimeForApi(form.startTime),
    endTime: normalizeTimeForApi(form.endTime),
  };
}
