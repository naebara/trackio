import {
  addDays,
  compareDateKeys,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  formatDateKey,
  getDayOfMonth,
  getDayOfWeek,
  getDaysInMonth,
  parseDateKey,
} from "./date";
import type { RecurrenceRule, Topic } from "./types";

function normalizeEndDate(topic: Topic) {
  if (topic.endDate && topic.archivedAt) {
    return compareDateKeys(topic.endDate, topic.archivedAt) < 0
      ? topic.endDate
      : topic.archivedAt;
  }

  return topic.endDate ?? topic.archivedAt ?? null;
}

export function isTopicActiveOnDate(topic: Topic, date: string) {
  const endDate = normalizeEndDate(topic);

  if (compareDateKeys(date, topic.startDate) < 0) return false;
  if (endDate && compareDateKeys(date, endDate) > 0) return false;

  return true;
}

function firstWeeklyOccurrence(startDate: string, dayOfWeek: number) {
  const offset = (dayOfWeek - getDayOfWeek(startDate) + 7) % 7;
  return addDays(startDate, offset);
}

function firstMonthlyOccurrence(startDate: string, dayOfMonth: number) {
  const start = parseDateKey(startDate);
  const createCandidate = (year: number, monthIndex: number) => {
    const day = Math.min(dayOfMonth, getDaysInMonth(year, monthIndex));
    return formatDateKey(new Date(year, monthIndex, day, 12));
  };

  let candidate = createCandidate(start.getFullYear(), start.getMonth());
  if (compareDateKeys(candidate, startDate) < 0) {
    candidate = createCandidate(start.getFullYear(), start.getMonth() + 1);
  }

  return candidate;
}

function matchesWeekly(date: string, startDate: string, dayOfWeek: number, interval = 1) {
  if (getDayOfWeek(date) !== dayOfWeek) return false;

  const first = firstWeeklyOccurrence(startDate, dayOfWeek);
  if (compareDateKeys(date, first) < 0) return false;

  return differenceInWeeks(first, date) % interval === 0;
}

function matchesMonthly(
  date: string,
  startDate: string,
  dayOfMonth: number,
  interval = 1,
) {
  const parsedDate = parseDateKey(date);
  const expectedDay = Math.min(
    dayOfMonth,
    getDaysInMonth(parsedDate.getFullYear(), parsedDate.getMonth()),
  );

  if (getDayOfMonth(date) !== expectedDay) {
    return false;
  }

  const first = firstMonthlyOccurrence(startDate, dayOfMonth);
  if (compareDateKeys(date, first) < 0) return false;

  return differenceInMonths(first, date) % interval === 0;
}

export function isExpectedOnDate(rule: RecurrenceRule, startDate: string, date: string) {
  switch (rule.type) {
    case "daily":
      return true;
    case "everyXDays":
      return differenceInDays(startDate, date) % Math.max(1, rule.interval ?? 1) === 0;
    case "selectedWeekdays":
      return (rule.weekdays ?? []).includes(getDayOfWeek(date));
    case "weekly":
      return matchesWeekly(date, startDate, rule.dayOfWeek ?? getDayOfWeek(startDate), 1);
    case "monthly":
      return matchesMonthly(
        date,
        startDate,
        rule.dayOfMonth ?? getDayOfMonth(startDate),
        1,
      );
    case "custom":
      if (rule.unit === "week") {
        return matchesWeekly(
          date,
          startDate,
          rule.dayOfWeek ?? getDayOfWeek(startDate),
          Math.max(1, rule.interval ?? 1),
        );
      }

      if (rule.unit === "month") {
        return matchesMonthly(
          date,
          startDate,
          rule.dayOfMonth ?? getDayOfMonth(startDate),
          Math.max(1, rule.interval ?? 1),
        );
      }

      return differenceInDays(startDate, date) % Math.max(1, rule.interval ?? 1) === 0;
    default:
      return false;
  }
}

export function isTopicExpectedOnDate(topic: Topic, date: string) {
  if (!isTopicActiveOnDate(topic, date)) return false;
  return isExpectedOnDate(topic.recurrence, topic.startDate, date);
}

export function getRecurrenceSummary(topic: Topic) {
  const { recurrence } = topic;
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

  switch (recurrence.type) {
    case "daily":
      return "Daily";
    case "everyXDays":
      return `Every ${Math.max(1, recurrence.interval ?? 1)} day(s)`;
    case "selectedWeekdays":
      return (recurrence.weekdays ?? [])
        .map((weekday) =>
          weekdayFormatter.format(new Date(2026, 0, 4 + weekday, 12)),
        )
        .join(", ");
    case "weekly":
      return `Weekly on ${weekdayFormatter.format(new Date(2026, 0, 4 + (recurrence.dayOfWeek ?? 0), 12))}`;
    case "monthly":
      return `Monthly on day ${recurrence.dayOfMonth ?? getDayOfMonth(topic.startDate)}`;
    case "custom":
      return `Every ${Math.max(1, recurrence.interval ?? 1)} ${recurrence.unit ?? "day"}(s)`;
    default:
      return "Custom";
  }
}
