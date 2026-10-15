export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// DST-safe day offset — using setDate (calendar arithmetic) instead of adding
// raw milliseconds avoids landing an hour off local midnight across a DST transition.
export function addDays(date: Date, days: number) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Weeks run Monday–Sunday to match the native calendar picker's convention.
export function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay(); // 0 = Sun .. 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(start, diff);
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
