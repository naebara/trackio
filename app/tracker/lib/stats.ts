import {
  addDays,
  compareDateKeys,
  eachDayInRange,
  todayKey,
} from "./date";
import {
  getPeriodRange,
  getRecurrenceTarget,
  getRecurrenceUnit,
  isTargetRecurrence,
  isTopicActiveOnDate,
  isTopicExpectedOnDateWithEntries,
} from "./recurrence";
import type { DailyEntry, DaySummary, Topic, TopicCell, TopicStats } from "./types";

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function createEntryMap(entries: DailyEntry[]) {
  return new Map(entries.map((entry) => [`${entry.topicId}:${entry.date}`, entry]));
}

export function buildTopicCells(topic: Topic, dates: string[], entryMap: Map<string, DailyEntry>) {
  const today = todayKey();

  return dates.map<TopicCell>((date) => {
    const entry = entryMap.get(`${topic.id}:${date}`);
    const topicActive = isTopicActiveOnDate(topic, date);
    const expected = isTopicExpectedOnDateWithEntries(topic, date);

    if (!expected) {
      return {
        date,
        expected,
        topicActive,
        entry,
        state: topicActive ? "none" : "none",
      };
    }

    if (entry) {
      return { date, expected, topicActive, entry, state: "logged" };
    }

    return {
      date,
      expected,
      topicActive,
      entry,
      state: compareDateKeys(date, today) > 0 ? "upcoming" : "pending",
    };
  });
}

function calculateTargetTopicStats(
  topic: Topic,
  dates: string[],
  entryMap: Map<string, DailyEntry>,
) {
  if (dates.length === 0) {
    return {
      expectedDays: 0,
      loggedDays: 0,
      pendingDays: 0,
      averageLoggedValue: 0,
      coverageRate: 0,
      fullSuccessDays: 0,
      currentRecordedStreak: 0,
    };
  }

  const topicEndDate = topic.endDate ?? topic.archivedAt ?? null;
  const effectiveStart =
    compareDateKeys(topic.startDate, dates[0]) > 0 ? topic.startDate : dates[0];
  const effectiveEnd =
    topicEndDate && compareDateKeys(topicEndDate, dates[dates.length - 1]) < 0
      ? topicEndDate
      : dates[dates.length - 1];

  if (compareDateKeys(effectiveStart, effectiveEnd) > 0) {
    return {
      expectedDays: 0,
      loggedDays: 0,
      pendingDays: 0,
      averageLoggedValue: 0,
      coverageRate: 0,
      fullSuccessDays: 0,
      currentRecordedStreak: 0,
    };
  }

  const unit = getRecurrenceUnit(topic);
  const target = getRecurrenceTarget(topic);
  const periods: Array<{ achieved: number }> = [];
  const loggedEntries: DailyEntry[] = [];
  let cursor = effectiveStart;

  while (compareDateKeys(cursor, effectiveEnd) <= 0) {
    const range = getPeriodRange(cursor, unit);
    const activeStart =
      compareDateKeys(effectiveStart, range.start) > 0 ? effectiveStart : range.start;
    const activeEnd =
      compareDateKeys(effectiveEnd, range.end) < 0 ? effectiveEnd : range.end;

    const periodEntries = eachDayInRange(activeStart, activeEnd)
      .map((date) => entryMap.get(`${topic.id}:${date}`))
      .filter((entry): entry is DailyEntry => Boolean(entry));
    const recorded = periodEntries.filter((entry) => entry.value > 0).length;

    loggedEntries.push(...periodEntries);

    periods.push({ achieved: Math.min(target, recorded) });
    cursor = addDays(range.end, 1);
  }

  const expectedDays = periods.length * target;
  const loggedDays = periods.reduce((sum, period) => sum + period.achieved, 0);
  const pendingDays = Math.max(0, expectedDays - loggedDays);
  const averageLoggedValue = loggedEntries.length
    ? round(loggedEntries.reduce((sum, entry) => sum + entry.value, 0) / loggedEntries.length)
    : 0;
  let currentRecordedStreak = 0;

  for (let index = periods.length - 1; index >= 0; index -= 1) {
    if (periods[index].achieved < target) break;
    currentRecordedStreak += 1;
  }

  return {
    expectedDays,
    loggedDays,
    pendingDays,
    averageLoggedValue,
    coverageRate: expectedDays ? round((loggedDays / expectedDays) * 100) : 0,
    fullSuccessDays: loggedEntries.filter((entry) => entry.value === 100).length,
    currentRecordedStreak,
  };
}

export function calculateTopicStats(
  topic: Topic,
  dates: string[],
  entryMap: Map<string, DailyEntry>,
) {
  if (isTargetRecurrence(topic)) {
    return calculateTargetTopicStats(topic, dates, entryMap);
  }

  const cells = buildTopicCells(topic, dates, entryMap).filter((cell) => cell.expected);
  const logged = cells.filter((cell) => cell.entry);
  const pendingDays = cells.filter((cell) => cell.state === "pending").length;
  const valueSum = logged.reduce((sum, cell) => sum + (cell.entry?.value ?? 0), 0);
  let currentRecordedStreak = 0;

  for (let index = logged.length - 1; index >= 0; index -= 1) {
    if ((logged[index].entry?.value ?? 0) <= 0) break;
    currentRecordedStreak += 1;
  }

  const stats: TopicStats = {
    expectedDays: cells.length,
    loggedDays: logged.length,
    pendingDays,
    averageLoggedValue: logged.length ? round(valueSum / logged.length) : 0,
    coverageRate: cells.length ? round((logged.length / cells.length) * 100) : 0,
    fullSuccessDays: logged.filter((cell) => (cell.entry?.value ?? 0) === 100).length,
    currentRecordedStreak,
  };

  return stats;
}

export function calculateGlobalStats(
  topics: Topic[],
  entries: DailyEntry[],
  start: string,
  end: string,
) {
  const entryMap = createEntryMap(entries);
  const dates = eachDayInRange(start, end);

  const totals = topics.reduce(
    (accumulator, topic) => {
      const stats = calculateTopicStats(topic, dates, entryMap);

      accumulator.expectedDays += stats.expectedDays;
      accumulator.loggedDays += stats.loggedDays;
      accumulator.pendingDays += stats.pendingDays;
      accumulator.fullSuccessDays += stats.fullSuccessDays;
      accumulator.weightedValueSum += stats.averageLoggedValue * Math.max(stats.expectedDays, 1);
      return accumulator;
    },
    {
      expectedDays: 0,
      loggedDays: 0,
      pendingDays: 0,
      fullSuccessDays: 0,
      weightedValueSum: 0,
    },
  );

  return {
    expectedDays: totals.expectedDays,
    loggedDays: totals.loggedDays,
    pendingDays: totals.pendingDays,
    averageLoggedValue: totals.loggedDays
      ? round(totals.weightedValueSum / Math.max(totals.expectedDays, 1))
      : 0,
    coverageRate: totals.expectedDays
      ? round((totals.loggedDays / totals.expectedDays) * 100)
      : 0,
    fullSuccessDays: totals.fullSuccessDays,
  };
}

export function buildDaySummaries(
  topics: Topic[],
  entries: DailyEntry[],
  dates: string[],
) {
  const entryMap = createEntryMap(entries);

  return dates.map<DaySummary>((date) => {
    let expectedCount = 0;
    let loggedCount = 0;
    let valueSum = 0;

    topics.forEach((topic) => {
      if (!isTopicExpectedOnDateWithEntries(topic, date)) return;

      expectedCount += 1;
      const entry = entryMap.get(`${topic.id}:${date}`);
      if (entry) {
        loggedCount += 1;
        valueSum += entry.value;
      }
    });

    return {
      date,
      expectedCount,
      loggedCount,
      pendingCount: Math.max(0, expectedCount - loggedCount),
      averageLoggedValue: loggedCount ? round(valueSum / loggedCount) : 0,
    };
  });
}
