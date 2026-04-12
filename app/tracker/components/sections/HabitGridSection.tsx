"use client";

import { ActionIcon, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useRef } from "react";
import { addDays, todayKey } from "../../lib/date";
import { isTopicExpectedOnDate } from "../../lib/recurrence";
import { trackerText } from "../../constants/i18n";
import type { DailyEntry, Topic } from "../../lib/types";
import classes from "./HabitGridSection.module.css";

const TOUCH_MOVE_THRESHOLD = 10;

const DAY_COUNT = 14;

interface HabitGridSectionProps {
  topics: Topic[];
  entryMap: Map<string, DailyEntry>;
  onQuickLog: (topic: Topic, date: string) => void;
  onEditEntry: (topic: Topic, date: string) => void;
  onAddTopic: () => void;
  onTopicClick: (topic: Topic) => void;
}

function getRecentDays(count: number): string[] {
  const today = todayKey();
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    days.push(addDays(today, -i));
  }
  return days;
}

function getDayAbbr(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" }).toUpperCase().slice(0, 3);
}

function getDayNum(dateStr: string): string {
  return String(Number(dateStr.slice(-2)));
}

function getCellDisplay(entry?: DailyEntry): string {
  if (!entry) return "";
  if (entry.value === 100) return "✓";
  if (entry.value === 0) return "✗";
  return `${entry.value}%`;
}

function GridCell({
  topic,
  date,
  entry,
  expected,
  onQuickLog,
  onEdit,
}: {
  topic: Topic;
  date: string;
  entry?: DailyEntry;
  expected: boolean;
  onQuickLog: () => void;
  onEdit: () => void;
}) {
  const display = getCellDisplay(entry);
  const state = entry
    ? entry.value >= 50 ? "done" : "missed"
    : expected ? "pending" : "inactive";

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!expected || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;
    if (dx > TOUCH_MOVE_THRESHOLD || dy > TOUCH_MOVE_THRESHOLD) return;
    e.preventDefault();
    onQuickLog();
  }, [expected, onQuickLog]);

  return (
    <td>
      <button
        type="button"
        className={classes.cell}
        data-state={state}
        onClick={() => { if (expected) onQuickLog(); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          if (expected) onEdit();
        }}
      >
        {entry ? display : expected ? "○" : "·"}
      </button>
    </td>
  );
}

export default function HabitGridSection({
  topics,
  entryMap,
  onQuickLog,
  onEditEntry,
  onAddTopic,
  onTopicClick,
}: HabitGridSectionProps) {
  const days = getRecentDays(DAY_COUNT);
  const today = todayKey();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className={classes.container}>
      <Group className={classes.header} justify="space-between" align="center">
        <Text className={classes.title}>{trackerText.habitsTitle}</Text>
        <ActionIcon
          radius="md"
          variant="subtle"
          color="dark"
          onClick={onAddTopic}
          data-testid="tracker-add-topic-button"
        >
          <IconPlus size={20} />
        </ActionIcon>
      </Group>

      <div className={classes.scrollWrapper} ref={scrollRef}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th className={classes.stickyCol} />
              {days.map((date) => (
                <th
                  key={date}
                  className={classes.dayHeader}
                  data-today={date === today || undefined}
                >
                  <span className={classes.dayAbbr}>{getDayAbbr(date)}</span>
                  <span className={classes.dayNum}>{getDayNum(date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className={classes.topicRow}>
                <td className={classes.stickyCol}>
                  <button
                    type="button"
                    className={classes.topicCell}
                    onClick={() => onTopicClick(topic)}
                  >
                    <span
                      className={classes.dot}
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className={classes.topicName}>{topic.name}</span>
                  </button>
                </td>
                {days.map((date) => {
                  const entry = entryMap.get(`${topic.id}:${date}`);
                  const expected = isTopicExpectedOnDate(topic, date);

                  return (
                    <GridCell
                      key={date}
                      topic={topic}
                      date={date}
                      entry={entry}
                      expected={expected}
                      onQuickLog={() => onQuickLog(topic, date)}
                      onEdit={() => onEditEntry(topic, date)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topics.length === 0 && (
        <div className={classes.empty}>
          <Text c="dimmed" ta="center" py="xl">
            {trackerText.noActiveTopics}
          </Text>
        </div>
      )}
    </div>
  );
}
