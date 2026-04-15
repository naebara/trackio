"use client";

import { Paper, Progress, Stack, Text } from "@mantine/core";
import { trackerText } from "../../constants/i18n";
import type { Topic, TopicStats } from "../../lib/types";
import classes from "./InsightsSection.module.css";

interface InsightsSectionProps {
  topics: Topic[];
  topicStats: Record<string, TopicStats>;
}

export default function InsightsSection({
  topics,
  topicStats,
}: InsightsSectionProps) {
  const sorted = [...topics].sort(
    (left, right) =>
      (topicStats[right.id]?.coverageRate ?? 0) - (topicStats[left.id]?.coverageRate ?? 0),
  );

  return (
    <Paper className={classes.section} radius="md" data-testid="tracker-insights-panel">
      <Text className={classes.title}>Performance snapshot</Text>
      <Text className={classes.subtitle}>
        Coverage tracks how much of the expected workload was completed in the selected tracking windows.
      </Text>
      <Stack mt="lg" gap="md">
        {sorted.map((topic) => {
          const stats = topicStats[topic.id];

          return (
            <div key={topic.id} className={classes.row}>
              <div className={classes.heading}>
                <Text className={classes.topicName}>{topic.name}</Text>
                <Text className={classes.topicMeta}>
                  {stats?.loggedDays ?? 0} / {stats?.expectedDays ?? 0} {trackerText.loggedDays.toLowerCase()}
                </Text>
              </div>
              <Progress radius="md" value={stats?.coverageRate ?? 0} color="green" size="lg" />
              <div className={classes.detailRow}>
                <Text className={classes.detail}>{stats?.coverageRate ?? 0}% {trackerText.coverage.toLowerCase()}</Text>
                <Text className={classes.detail}>{stats?.averageLoggedValue ?? 0}% avg</Text>
                <Text className={classes.detail}>{stats?.pendingDays ?? 0} {trackerText.pendingDays.toLowerCase()}</Text>
              </div>
            </div>
          );
        })}
      </Stack>
    </Paper>
  );
}
