import {
  addDays,
  compareDateKeys,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  eachDayInRange,
  formatDateKey,
  getDayOfMonth,
  getDayOfWeek,
  getDaysInMonth,
  parseDateKey,
  getMonthEnd,
  getMonthStart,
  getWeekStart,
  getYearEnd,
  getYearStart,
} from "./date";
import type { DailyEntry, RecurrenceRule, RecurrenceUnit, Topic } from "./types";

function normalizeEndDate(topic: Topic) {
  if (topic.endDate && topic.archivedAt) {
    return compareDateKeys(topic.endDate, topic.archivedAt) < 0
      ? topic.endDate
      : topic.archivedAt;
  }

  return topic.endDate ?? topic.archivedAt ?? null;
}

function getRecurrenceRule(input: RecurrenceRule | Topic) {
  return "recurrence" in input ? input.recurrence : input;
}

function formatUnit(unit: RecurrenceUnit, count: number) {
  if (count === 1) return unit;

  switch (unit) {
    case "day":
      return "days";
    case "week":
      return "weeks";
    case "month":
      return "months";
    case "year":
      return "years";
  }
}

export function isTargetRecurrence(input: RecurrenceRule | Topic) {
  return getRecurrenceRule(input).type === "timesPerPeriod";
}

export function getRecurrenceTarget(input: RecurrenceRule | Topic) {
  return Math.max(1, getRecurrenceRule(input).target ?? 1);
}

export function getRecurrenceUnit(input: RecurrenceRule | Topic) {
  return getRecurrenceRule(input).unit ?? "week";
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
  date: string, startDate: string, dayOfMonth: number, interval = 1,
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

export function getPeriodRange(date: string, unit: RecurrenceUnit) {
  switch (unit) {
    case "day":
      return { start: date, end: date };
    case "week": {
      const start = getWeekStart(date);
      return { start, end: addDays(start, 6) };
    }
    case "month":
      return { start: getMonthStart(date), end: getMonthEnd(date) };
    case "year":
      return { start: getYearStart(date), end: getYearEnd(date) };
  }
}

function countCompletedTargetDays(
  topicId: string,
  start: string,
  end: string,
  entryMap: Map<string, DailyEntry>,
) {
  if (compareDateKeys(start, end) > 0) return 0;

  return eachDayInRange(start, end).reduce(
    (total, currentDate) =>
      total + ((entryMap.get(`${topicId}:${currentDate}`)?.value ?? 0) > 0 ? 1 : 0),
    0,
  );
}

export function getTargetProgressForDate(
  topic: Topic,
  date: string,
  entryMap: Map<string, DailyEntry>,
) {
  if (!isTargetRecurrence(topic)) return null;

  const unit = getRecurrenceUnit(topic);
  const target = getRecurrenceTarget(topic);
  const { start, end } = getPeriodRange(date, unit);
  const endDate = normalizeEndDate(topic);
  const activeStart =
    compareDateKeys(topic.startDate, start) > 0 ? topic.startDate : start;
  const activeEnd = endDate && compareDateKeys(endDate, end) < 0 ? endDate : end;
  const currentValue = Math.max(0, entryMap.get(`${topic.id}:${date}`)?.value ?? 0);

  if (compareDateKeys(activeStart, activeEnd) > 0) {
    return {
      unit,
      target,
      start,
      end,
      completed: 0,
      completedBeforeDate: 0,
      currentValue,
      remaining: target,
    };
  }

  const completed = countCompletedTargetDays(topic.id, activeStart, activeEnd, entryMap);
  const previousDate = addDays(date, -1);
  const completedBeforeDate =
    compareDateKeys(previousDate, activeStart) >= 0
      ? countCompletedTargetDays(topic.id, activeStart, previousDate, entryMap)
      : 0;

  return {
    unit,
    target,
    start,
    end,
    completed,
    completedBeforeDate,
    currentValue,
    remaining: Math.max(0, target - Math.min(target, completed)),
  };
}

export function getEntryValueLabel(_topic: Topic, value: number) {
  return `${value}%`;
}

export function getTargetProgressLabel(
  topic: Topic,
  date: string,
  entryMap: Map<string, DailyEntry>,
) {
  const progress = getTargetProgressForDate(topic, date, entryMap);
  if (!progress) return null;
  return `${Math.min(progress.completed, progress.target)} / ${progress.target} this ${progress.unit}`;
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
    case "timesPerPeriod":
      return true;
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

export function isTopicExpectedOnDateWithEntries(topic: Topic, date: string) {
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
    case "timesPerPeriod":
      return `${getRecurrenceTarget(recurrence)} time(s) per ${formatUnit(
        getRecurrenceUnit(recurrence),
        getRecurrenceTarget(recurrence),
      )}`;
    case "custom":
      return `Every ${Math.max(1, recurrence.interval ?? 1)} ${formatUnit(
        recurrence.unit ?? "day",
        Math.max(1, recurrence.interval ?? 1),
      )}`;
    default:
      return "Custom";
  }
}
