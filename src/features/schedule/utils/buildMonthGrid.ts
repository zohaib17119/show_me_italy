import { formatLocalDateKey, todayLocalDateKey } from '@/api/utils/date';

export interface MonthGridDay {
  date: string;
  day: number;
  otherMonth?: boolean;
  isToday?: boolean;
}

const FIVE_WEEK_CELLS = 35;
const SIX_WEEK_CELLS = 42;

export function buildMonthGrid(year: number, month: number): MonthGridDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayLocalDateKey();

  let startOffset = new Date(year, month, 1).getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells = startOffset + daysInMonth > FIVE_WEEK_CELLS ? SIX_WEEK_CELLS : FIVE_WEEK_CELLS;

  const days: MonthGridDay[] = [];
  const prevMonthLast = new Date(year, month, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthLast - i;
    days.push({
      date: formatLocalDateKey(year, month - 1, day),
      day,
      otherMonth: true,
    });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = formatLocalDateKey(year, month, d);
    days.push({ date, day: d, isToday: date === today });
  }

  let nextMonthDay = 1;
  while (days.length < cells) {
    days.push({
      date: formatLocalDateKey(year, month + 1, nextMonthDay),
      day: nextMonthDay,
      otherMonth: true,
    });
    nextMonthDay += 1;
  }

  return days;
}
