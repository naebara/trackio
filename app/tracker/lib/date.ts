const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return formatDateKey(new Date());
}

export function addDays(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return formatDateKey(date);
}

export function addMonths(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setMonth(date.getMonth() + amount);
  return formatDateKey(date);
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function clampDateKey(date: string, min: string, max: string) {
  if (compareDateKeys(date, min) < 0) return min;
  if (compareDateKeys(date, max) > 0) return max;
  return date;
}

export function differenceInDays(start: string, end: string) {
  const startDate = parseDateKey(start).getTime();
  const endDate = parseDateKey(end).getTime();
  return Math.round((endDate - startDate) / DAY_IN_MS);
}

export function differenceInWeeks(start: string, end: string) {
  return Math.floor(differenceInDays(start, end) / 7);
}

export function differenceInMonths(start: string, end: string) {
  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth()
  );
}

export function getDayOfWeek(dateKey: string) {
  return parseDateKey(dateKey).getDay();
}

export function getDayOfMonth(dateKey: string) {
  return parseDateKey(dateKey).getDate();
}

export function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getMonthStart(dateKey: string) {
  const date = parseDateKey(dateKey);
  return formatDateKey(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}

export function getMonthEnd(dateKey: string) {
  const date = parseDateKey(dateKey);
  return formatDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0, 12));
}

export function getWeekStart(dateKey: string) {
  return addDays(dateKey, -getDayOfWeek(dateKey));
}

export function eachDayInRange(start: string, end: string) {
  const values: string[] = [];
  let cursor = start;

  while (compareDateKeys(cursor, end) <= 0) {
    values.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return values;
}

export function formatDayLabel(dateKey: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parseDateKey(dateKey));
}

export function formatMonthLabel(dateKey: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(parseDateKey(dateKey));
}
