import type { Language, TourSlotFilter, TourType } from '@/api/types';
import { getDayRange, getMonthGridRange, getWeekRange } from '@/api/utils/date';
import type { LangCode } from '@/types';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface BuildTourSlotFilterParams {
  viewMode: CalendarViewMode;
  monthGridDates: string[];
  selectedDate: string;
  enabledLangs: Set<LangCode>;
  enabledTourTypeIds: Set<number>;
  languages: Language[];
  tourTypes: TourType[];
}

export function buildTourSlotFilter({
  viewMode,
  monthGridDates,
  selectedDate,
  enabledLangs,
  enabledTourTypeIds,
  languages,
  tourTypes,
}: BuildTourSlotFilterParams): TourSlotFilter {
  let startDate: string | null = null;
  let endDate: string | null = null;

  if (viewMode === 'month') {
    const range = getMonthGridRange(monthGridDates);
    startDate = range?.start ?? null;
    endDate = range?.end ?? null;
  } else if (viewMode === 'week') {
    const range = getWeekRange(selectedDate);
    startDate = range.start;
    endDate = range.end;
  } else {
    const range = getDayRange(selectedDate);
    startDate = range.start;
    endDate = range.end;
  }

  const activeLanguageIds = languages
    .filter((lang) => {
      const code = lang.code?.slice(0, 2).toUpperCase() as LangCode;
      return code && enabledLangs.has(code) && lang.languageId != null;
    })
    .map((lang) => lang.languageId as number);

  const allLanguageIds = languages
    .filter((lang) => lang.languageId != null)
    .map((lang) => lang.languageId as number);

  const languageIds =
    activeLanguageIds.length > 0 && activeLanguageIds.length < allLanguageIds.length
      ? activeLanguageIds.join(',')
      : null;

  const activeTourTypeIds = tourTypes
    .filter((tour) => tour.tourTypeId != null && enabledTourTypeIds.has(tour.tourTypeId))
    .map((tour) => tour.tourTypeId as number);

  const allTourTypeIds = tourTypes
    .filter((tour) => tour.tourTypeId != null)
    .map((tour) => tour.tourTypeId as number);

  const filter: TourSlotFilter = {
    startDate,
    endDate,
    languageIds,
  };

  if (
    activeTourTypeIds.length === 1 &&
    activeTourTypeIds.length < allTourTypeIds.length
  ) {
    filter.tourTypeId = activeTourTypeIds[0];
  } else if (
    activeTourTypeIds.length > 1 &&
    activeTourTypeIds.length < allTourTypeIds.length
  ) {
    filter.tourTypeIds = activeTourTypeIds.join(',');
  }

  return filter;
}

export function tourSlotFilterKey(filter: TourSlotFilter): string {
  return JSON.stringify(filter);
}

export function calendarTitle(
  viewMode: CalendarViewMode,
  cursor: { year: number; month: number },
  selectedDate: string,
  monthNames: string[],
): string {
  if (viewMode === 'month') {
    return `${monthNames[cursor.month]} ${cursor.year}`;
  }
  if (viewMode === 'day') {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const { start, end } = getWeekRange(selectedDate);
  const startKey = start.slice(0, 10);
  const endKey = end.slice(0, 10);
  const [sy, sm, sd] = startKey.split('-').map(Number);
  const [ey, em, ed] = endKey.split('-').map(Number);
  const startLabel = new Date(sy, sm - 1, sd).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const endLabel = new Date(ey, em - 1, ed).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}
