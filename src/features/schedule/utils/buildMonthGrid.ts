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

  // Compute prev-month anchor via Date to handle January → December year rollback
  const prevMonthDate = new Date(year, month, 0); // last day of prev month
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth(); // 0-indexed, correct for formatLocalDateKey
  const prevMonthLast = prevMonthDate.getDate();

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthLast - i;
    days.push({
      date: formatLocalDateKey(prevYear, prevMonth, day),
      day,
      otherMonth: true,
    });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = formatLocalDateKey(year, month, d);
    days.push({ date, day: d, isToday: date === today });
  }

  // Compute next-month anchor via Date to handle December → January year rollover
  const nextMonthDate = new Date(year, month + 1, 1); // first day of next month
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth(); // 0-indexed, correct for formatLocalDateKey

  let nextMonthDay = 1;
  while (days.length < cells) {
    days.push({
      date: formatLocalDateKey(nextYear, nextMonth, nextMonthDay),
      day: nextMonthDay,
      otherMonth: true,
    });
    nextMonthDay += 1;
  }

  return days;
}
