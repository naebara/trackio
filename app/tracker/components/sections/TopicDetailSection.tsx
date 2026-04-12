"use client";

import { ActionIcon, Group, SegmentedControl, SimpleGrid, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  addDays,
  eachDayInRange,
  getMonthEnd,
  getMonthStart,
  todayKey,
} from "../../lib/date";
import { isTopicExpectedOnDate, getRecurrenceSummary } from "../../lib/recurrence";
import { trackerText } from "../../constants/i18n";
import type { DailyEntry, Topic } from "../../lib/types";
import TopicCalendar from "./TopicCalendar";
import classes from "./TopicDetailSection.module.css";

type TimeRange = "week" | "month" | "year" | "all" | "custom";

interface TopicDetailSectionProps {
  topic: Topic;
  entryMap: Map<string, DailyEntry>;
  onBack: () => void;
  onQuickLog: (topic: Topic, date: string) => void;
  onEditEntry: (topic: Topic, date: string) => void;
}

const rangeOptions = [
  { value: "week", label: trackerText.rangeWeek },
  { value: "month", label: trackerText.rangeMonth },
  { value: "year", label: trackerText.rangeYear },
  { value: "all", label: trackerText.rangeAll },
  { value: "custom", label: trackerText.rangeCustom },
];

function getStatsRange(range: TimeRange, topic: Topic, cs: string, ce: string) {
  const today = todayKey();
  switch (range) {
    case "week": return { start: addDays(today, -6), end: today };
    case "month": return { start: getMonthStart(today), end: getMonthEnd(today) };
    case "year": return { start: `${today.slice(0, 4)}-01-01`, end: today };
    case "all": return { start: topic.startDate, end: today };
    case "custom": return { start: cs || addDays(today, -30), end: ce || today };
  }
}

export default function TopicDetailSection({
  topic,
  entryMap,
  onBack,
  onQuickLog,
  onEditEntry,
}: TopicDetailSectionProps) {
  const [range, setRange] = useState<TimeRange>("month");
  const [monthKey, setMonthKey] = useState(todayKey());
  const [customStart, setCustomStart] = useState(addDays(todayKey(), -30));
  const [customEnd, setCustomEnd] = useState(todayKey());

  const statsRange = getStatsRange(range, topic, customStart, customEnd);
  const stats = useMemo(() => {
    const dates = eachDayInRange(statsRange.start, statsRange.end);
    let expected = 0, logged = 0, sumValues = 0;
    for (const date of dates) {
      if (isTopicExpectedOnDate(topic, date)) {
        expected++;
        const entry = entryMap.get(`${topic.id}:${date}`);
        if (entry) { logged++; sumValues += entry.value; }
      }
    }
    return {
      expected,
      logged,
      coverage: expected > 0 ? Math.round((logged / expected) * 100) : 0,
      average: logged > 0 ? Math.round(sumValues / logged) : 0,
    };
  }, [statsRange.start, statsRange.end, topic, entryMap]);

  return (
    <div className={classes.container}>
      <Group className={classes.header} gap="sm" align="center">
        <ActionIcon radius="md" variant="subtle" onClick={onBack}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <div>
          <Group gap="xs" align="center">
            <span className={classes.dot} style={{ backgroundColor: topic.color }} />
            <Text className={classes.topicName}>{topic.name}</Text>
          </Group>
          <Text className={classes.recurrence}>{getRecurrenceSummary(topic)}</Text>
        </div>
      </Group>

      <SegmentedControl
        className={classes.rangeControl}
        data={rangeOptions}
        value={range}
        onChange={(v) => setRange(v as TimeRange)}
        size="xs"
        radius="md"
        fullWidth
      />

      {range === "custom" && (
        <Group className={classes.customInputs} grow>
          <input
            type="date"
            className={classes.dateInput}
            value={customStart}
            onChange={(e) => setCustomStart(e.currentTarget.value)}
          />
          <input
            type="date"
            className={classes.dateInput}
            value={customEnd}
            onChange={(e) => setCustomEnd(e.currentTarget.value)}
          />
        </Group>
      )}

      <SimpleGrid cols={4} className={classes.statsGrid} spacing="xs">
        <div className={classes.statBox}>
          <Text className={classes.statLabel}>{trackerText.coverage}</Text>
          <Text className={classes.statValue}>{stats.coverage}%</Text>
        </div>
        <div className={classes.statBox}>
          <Text className={classes.statLabel}>{trackerText.avgValue}</Text>
          <Text className={classes.statValue}>{stats.average}%</Text>
        </div>
        <div className={classes.statBox}>
          <Text className={classes.statLabel}>{trackerText.loggedDays}</Text>
          <Text className={classes.statValue}>{stats.logged}</Text>
        </div>
        <div className={classes.statBox}>
          <Text className={classes.statLabel}>{trackerText.expectedDays}</Text>
          <Text className={classes.statValue}>{stats.expected}</Text>
        </div>
      </SimpleGrid>

      <TopicCalendar
        topic={topic}
        entryMap={entryMap}
        range={range}
        monthKey={monthKey}
        onMonthChange={setMonthKey}
        customStart={customStart}
        customEnd={customEnd}
        onQuickLog={onQuickLog}
        onEditEntry={onEditEntry}
      />
    </div>
  );
}
