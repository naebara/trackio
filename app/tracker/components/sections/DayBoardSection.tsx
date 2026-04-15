"use client";

import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { formatDayLabel } from "../../lib/date";
import {
  getEntryValueLabel,
  getRecurrenceSummary,
  getTargetProgressLabel,
} from "../../lib/recurrence";
import type { DailyEntry, Topic } from "../../lib/types";
import QuickLogActions from "../QuickLogActions";
import classes from "./DayBoardSection.module.css";

interface DayBoardSectionProps {
  date: string;
  topics: Topic[];
  entryMap: Map<string, DailyEntry>;
  onLogValue: (topic: Topic, date: string, value: number) => void;
  onEditEntry: (topic: Topic, date: string) => void;
}

export default function DayBoardSection({
  date,
  topics,
  entryMap,
  onLogValue,
  onEditEntry,
}: DayBoardSectionProps) {
  return (
    <Paper className={classes.section} radius="md" data-testid="tracker-day-list">
      <Group justify="space-between" align="flex-end">
        <div>
          <Text className={classes.title}>Expected on {formatDayLabel(date)}</Text>
          <Text className={classes.subtitle}>
            Missing stays neutral. Quick actions save immediately.
          </Text>
        </div>
        <Badge radius="md" size="lg" variant="light">
          {topics.length} expected
        </Badge>
      </Group>
      <Stack mt="lg" gap="sm">
        {topics.length === 0 && (
          <Paper className={classes.empty} radius="lg">
            <Text>No topics are expected on this date.</Text>
          </Paper>
        )}
        {topics.map((topic) => {
          const entry = entryMap.get(`${topic.id}:${date}`);
          const progressValue = entry?.value ?? 0;
          const badgeLabel = entry
            ? getEntryValueLabel(topic, entry.value)
            : "Not logged";
          const targetProgressLabel = getTargetProgressLabel(topic, date, entryMap);
          const summaryLabel = targetProgressLabel
            ? `${getRecurrenceSummary(topic)} • ${targetProgressLabel}`
            : getRecurrenceSummary(topic);

          return (
            <Paper key={topic.id} className={classes.card} radius="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div className={classes.topicMeta}>
                  <span className={classes.color} style={{ backgroundColor: topic.color }} />
                  <div>
                    <Text className={classes.topicName}>{topic.name}</Text>
                    <Text className={classes.topicDescription}>
                      {topic.description || summaryLabel}
                    </Text>
                  </div>
                </div>
                <Group gap="xs">
                  <Badge radius="md" variant={entry ? "filled" : "light"} color={entry ? "green" : "gray"}>
                    {badgeLabel}
                  </Badge>
                  <QuickLogActions
                    onYes={() => onLogValue(topic, date, 100)}
                    onNo={() => onLogValue(topic, date, 0)}
                    onCustom={() => onEditEntry(topic, date)}
                  />
                </Group>
              </Group>
              <Progress
                className={classes.progress}
                radius="md"
                size="lg"
                color={entry ? (progressValue >= 50 ? "green" : "red") : "blue"}
                value={entry ? progressValue : 0}
              />
              {entry?.note && <Text className={classes.note}>{entry.note}</Text>}
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
