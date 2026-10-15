import { addDays, startOfDay } from "@/lib/week";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function dailyCounts(dates: Date[], days = 7): number[] {
  const todayStart = startOfDay(new Date());
  const firstBucketStart = addDays(todayStart, -(days - 1));
  const counts = new Array(days).fill(0);

  for (const date of dates) {
    // Rounding (rather than floor) absorbs the sub-day drift a DST transition
    // introduces between two local-midnight timestamps.
    const index = Math.round((startOfDay(date).getTime() - firstBucketStart.getTime()) / MS_PER_DAY);
    if (index >= 0 && index < days) counts[index] += 1;
  }

  return counts;
}
