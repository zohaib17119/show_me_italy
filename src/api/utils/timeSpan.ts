/** Convert HH:mm or HH:mm:ss to .NET TimeSpan ticks (100-nanosecond intervals). */
export function timeStringToTicks(time: string): number {
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds * 10_000_000;
}

export function ticksToTimeString(value: TimeSpanLike | undefined): string {
  if (!value) return '00:00';
  if (typeof value === 'string') return value.slice(0, 5);
  if (typeof value.ticks === 'number') {
    const totalSeconds = Math.floor(value.ticks / 10_000_000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return '00:00';
}

type TimeSpanLike = { ticks?: number } | string;

export function buildTimeSpan(time: string): { ticks: number } {
  return { ticks: timeStringToTicks(time.length === 5 ? `${time}:00` : time) };
}
