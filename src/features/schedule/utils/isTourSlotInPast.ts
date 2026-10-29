/** True when the tour slot start (local date + start time) is at or before now. */
export function isTourSlotInPast(slotDate?: string, startTime?: string): boolean {
 const dateKey = (slotDate ?? '').trim().slice(0, 10);
 // If we cannot parse the date, do not block delete.
 if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;

 const [year, month, day] = dateKey.split('-').map(Number);
 const rawTime = (startTime ?? '').trim();
 const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
 const hours = timeMatch ? Number(timeMatch[1]) : 0;
 const minutes = timeMatch ? Number(timeMatch[2]) : 0;
 const seconds = timeMatch?.[3] != null ? Number(timeMatch[3]) : 0;

 const slotStart = new Date(year, month - 1, day, hours, minutes, seconds);
 if (Number.isNaN(slotStart.getTime())) return false;
 return slotStart.getTime() <= Date.now();
}