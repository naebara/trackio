"use client";

import { Badge, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { formatDayLabel } from "../../lib/date";
import { getRecurrenceSummary } from "../../lib/recurrence";
import type { DailyEntry, Topic } from "../../lib/types";
import QuickLogActions from "../QuickLogActions";
import classes from "./DayBoardSection.module.css";

interface DayBoardSectionProps {
  date: string;
  topics: Topic[];
  entryMap: Map<string, DailyEntry>;
  onLogValue: (topicId: string, date: string, value: number) => void;
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
    <Paper className={classes.section} radius="xl" withBorder data-testid="tracker-day-list">
      <Group justify="space-between" align="flex-end">
        <div>
          <Text className={classes.title}>Expected on {formatDayLabel(date)}</Text>
          <Text className={classes.subtitle}>
            Missing stays neutral. Quick actions save immediately.
          </Text>
        </div>
        <Badge radius="xl" size="lg" variant="light">
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

          return (
            <Paper key={topic.id} className={classes.card} radius="xl">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div className={classes.topicMeta}>
                  <span className={classes.color} style={{ backgroundColor: topic.color }} />
                  <div>
                    <Text className={classes.topicName}>{topic.name}</Text>
                    <Text className={classes.topicDescription}>
                      {topic.description || getRecurrenceSummary(topic)}
                    </Text>
                  </div>
                </div>
                <Group gap="xs">
                  <Badge radius="xl" variant={entry ? "filled" : "light"} color={entry ? "green" : "gray"}>
                    {entry ? `${entry.value}%` : "Not logged"}
                  </Badge>
                  <QuickLogActions
                    onYes={() => onLogValue(topic.id, date, 100)}
                    onNo={() => onLogValue(topic.id, date, 0)}
                    onCustom={() => onEditEntry(topic, date)}
                  />
                </Group>
              </Group>
              <Progress
                className={classes.progress}
                radius="xl"
                size="lg"
                color={progressValue === 100 ? "green" : progressValue === 0 ? "red" : "blue"}
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
