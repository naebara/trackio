"use client";

import { ActionIcon, Group, SimpleGrid, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  addDays,
  addMonths,
  eachDayInRange,
  formatMonthLabel,
  getDayOfWeek,
  getMonthEnd,
  getMonthStart,
  todayKey,
} from "../../lib/date";
import {
  getEntryValueLabel,
  isTopicExpectedOnDateWithEntries,
  isTargetRecurrence,
} from "../../lib/recurrence";
import type { DailyEntry, Topic } from "../../lib/types";
import classes from "./TopicCalendar.module.css";

type TimeRange = "week" | "month" | "year" | "all" | "custom";

interface TopicCalendarProps {
  topic: Topic;
  entryMap: Map<string, DailyEntry>;
  range: TimeRange;
  monthKey: string;
  onMonthChange: (key: string) => void;
  customStart: string;
  customEnd: string;
  onQuickLog: (topic: Topic, date: string) => void;
  onEditEntry: (topic: Topic, date: string) => void;
}

const WEEKDAYS_LONG = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getCellLevel(entry: DailyEntry | undefined, expected: boolean): string {
  if (!expected) return "inactive";
  if (!entry) return "pending";
  if (entry.value >= 80) return "high";
  if (entry.value >= 50) return "medium";
  if (entry.value > 0) return "low";
  return "zero";
}

function getCellLabel(entry?: DailyEntry, expected?: boolean): string {
  if (!entry) return expected ? "○" : "";
  if (entry.value === 100) return "✓";
  if (entry.value === 0) return "✗";
  return `${entry.value}%`;
}

function getDayAbbr(dateStr: string): string {
  return new Date(dateStr + "T12:00:00")
    .toLocaleDateString("en", { weekday: "short" })
    .toUpperCase()
    .slice(0, 3);
}

function MiniMonth({
  monthKey,
  topic,
  entryMap,
  onQuickLog,
}: {
  monthKey: string;
  topic: Topic;
  entryMap: Map<string, DailyEntry>;
  onQuickLog: (topic: Topic, date: string) => void;
}) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  const days = eachDayInRange(start, end);
  const blanks = getDayOfWeek(start);
  const label = formatMonthLabel(monthKey).split(" ")[0];

  return (
    <div className={classes.miniMonth}>
      <Text className={classes.miniLabel}>{label}</Text>
      <div className={classes.miniGrid}>
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b-${i}`} className={classes.miniBlank} />
        ))}
        {days.map((date) => {
          const entry = entryMap.get(`${topic.id}:${date}`);
          const expected = isTopicExpectedOnDateWithEntries(topic, date, entryMap);
          const level = getCellLevel(entry, expected);
          return (
            <button
              key={date}
              type="button"
              className={classes.miniCell}
              data-level={level}
              data-today={date === todayKey() || undefined}
              title={`${date}: ${entry ? getEntryValueLabel(topic, entry.value) : expected ? "Not logged" : "—"}`}
              onClick={() => { if (expected) onQuickLog(topic, date); }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function TopicCalendar({
  topic,
  entryMap,
  range,
  monthKey,
  onMonthChange,
  customStart,
  customEnd,
  onQuickLog,
  onEditEntry,
}: TopicCalendarProps) {
  const today = todayKey();

  if (range === "week") {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)));
    return (
      <div className={classes.weekGrid}>
        {days.map((date) => {
          const entry = entryMap.get(`${topic.id}:${date}`);
          const expected = isTopicExpectedOnDateWithEntries(topic, date, entryMap);
          const level = getCellLevel(entry, expected);
          return (
            <button
              key={date}
              type="button"
              className={classes.weekDay}
              data-level={level}
              data-today={date === today || undefined}
              onClick={() => { if (expected) onQuickLog(topic, date); }}
              onContextMenu={(e) => { e.preventDefault(); if (expected) onEditEntry(topic, date); }}
            >
              <span className={classes.weekAbbr}>{getDayAbbr(date)}</span>
              <span className={classes.weekNum}>{Number(date.slice(-2))}</span>
              <span className={classes.weekStatus} data-level={level}>
                {isTargetRecurrence(topic) && entry
                  ? getEntryValueLabel(topic, entry.value)
                  : getCellLabel(entry, expected)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (range === "month") {
    const start = getMonthStart(monthKey);
    const end = getMonthEnd(monthKey);
    const days = eachDayInRange(start, end);
    const blanks = getDayOfWeek(start);
    return (
      <>
        <Group className={classes.monthNav} justify="space-between">
          <ActionIcon radius="md" variant="default" onClick={() => onMonthChange(addMonths(monthKey, -1))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text className={classes.monthLabel}>{formatMonthLabel(monthKey)}</Text>
          <ActionIcon radius="md" variant="default" onClick={() => onMonthChange(addMonths(monthKey, 1))}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <SimpleGrid cols={7} spacing={4} className={classes.monthGrid}>
          {WEEKDAYS_LONG.map((wd) => (
            <Text key={wd} className={classes.monthWeekday}>{wd}</Text>
          ))}
          {Array.from({ length: blanks }, (_, i) => <div key={`b-${i}`} />)}
          {days.map((date) => {
            const entry = entryMap.get(`${topic.id}:${date}`);
            const expected = isTopicExpectedOnDateWithEntries(topic, date, entryMap);
            const level = getCellLevel(entry, expected);
            return (
              <button
                key={date}
                type="button"
                className={classes.monthDay}
                data-level={level}
                data-today={date === today || undefined}
                onClick={() => { if (expected) onQuickLog(topic, date); }}
                onContextMenu={(e) => { e.preventDefault(); if (expected) onEditEntry(topic, date); }}
              >
                <span className={classes.monthDayNum}>{Number(date.slice(-2))}</span>
                {entry && (
                  <span className={classes.monthDayVal}>
                    {isTargetRecurrence(topic)
                      ? getEntryValueLabel(topic, entry.value)
                      : entry.value > 0 && entry.value < 100
                        ? `${entry.value}%`
                        : ""}
                  </span>
                )}
              </button>
            );
          })}
        </SimpleGrid>
      </>
    );
  }

  // Year, All, Custom → render mini-month grids
  let years: number[] = [];
  if (range === "year") {
    years = [Number(today.slice(0, 4))];
  } else if (range === "all") {
    const startYear = Number(topic.startDate.slice(0, 4));
    const endYear = Number(today.slice(0, 4));
    for (let y = endYear; y >= startYear; y -= 1) years.push(y);
  } else {
    const startYear = Number(customStart.slice(0, 4));
    const endYear = Number(customEnd.slice(0, 4));
    for (let y = endYear; y >= startYear; y -= 1) years.push(y);
  }

  return (
    <div className={classes.yearsContainer}>
      {years.map((year) => (
        <div key={year} className={classes.yearBlock}>
          {years.length > 1 && (
            <Text className={classes.yearLabel}>{year}</Text>
          )}
          <div className={classes.yearGrid}>
            {Array.from({ length: 12 }, (_, i) => {
              const mk = `${year}-${String(i + 1).padStart(2, "0")}-01`;
              return (
                <MiniMonth
                  key={mk}
                  monthKey={mk}
                  topic={topic}
                  entryMap={entryMap}
                  onQuickLog={onQuickLog}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
