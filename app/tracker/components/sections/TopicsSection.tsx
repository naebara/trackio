"use client";

import { ActionIcon, Badge, Button, Group, Menu, Paper, Stack, Text } from "@mantine/core";
import { IconArchive, IconDots, IconEdit, IconRestore, IconTrash } from "@tabler/icons-react";
import { getRecurrenceSummary } from "../../lib/recurrence";
import type { Topic, TopicStats } from "../../lib/types";
import classes from "./TopicsSection.module.css";

interface TopicsSectionProps {
  activeTopics: Topic[];
  archivedTopics: Topic[];
  topicStats: Record<string, TopicStats>;
  onCreate: () => void;
  onEdit: (topic: Topic) => void;
  onArchive: (topicId: string) => void;
  onRestore: (topicId: string) => void;
  onDelete: (topicId: string) => void;
}

function TopicCard({
  topic,
  stats,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  topic: Topic;
  stats?: TopicStats;
  onEdit: (topic: Topic) => void;
  onArchive: (topicId: string) => void;
  onRestore: (topicId: string) => void;
  onDelete: (topicId: string) => void;
}) {
  const archived = Boolean(topic.archivedAt);

  return (
    <Paper className={classes.card} radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Group gap="xs">
            <span className={classes.dot} style={{ backgroundColor: topic.color }} />
            <Text className={classes.topicName}>{topic.name}</Text>
            <Badge radius="md" variant={archived ? "filled" : "light"} color={archived ? "gray" : "green"}>
              {archived ? "Archived" : "Active"}
            </Badge>
          </Group>
          <Text className={classes.topicSummary}>{getRecurrenceSummary(topic)}</Text>
          <Text className={classes.topicDescription}>
            {topic.description || "No additional guidance yet."}
          </Text>
        </div>
        <Menu withinPortal position="bottom-end">
          <Menu.Target>
            <ActionIcon radius="md" variant="default">
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(topic)}>
              Edit
            </Menu.Item>
            {archived ? (
              <Menu.Item leftSection={<IconRestore size={16} />} onClick={() => onRestore(topic.id)}>
                Restore
              </Menu.Item>
            ) : (
              <Menu.Item leftSection={<IconArchive size={16} />} onClick={() => onArchive(topic.id)}>
                Archive
              </Menu.Item>
            )}
            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => onDelete(topic.id)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Group className={classes.metrics} grow>
        <div>
          <Text className={classes.metricLabel}>Expected</Text>
          <Text className={classes.metricValue}>{stats?.expectedDays ?? 0}</Text>
        </div>
        <div>
          <Text className={classes.metricLabel}>Coverage</Text>
          <Text className={classes.metricValue}>{stats?.coverageRate ?? 0}%</Text>
        </div>
        <div>
          <Text className={classes.metricLabel}>Avg. progress</Text>
          <Text className={classes.metricValue}>{stats?.averageLoggedValue ?? 0}%</Text>
        </div>
      </Group>
    </Paper>
  );
}

export default function TopicsSection({
  activeTopics,
  archivedTopics,
  topicStats,
  onCreate,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: TopicsSectionProps) {
  return (
    <Paper className={classes.section} radius="md" data-testid="tracker-topic-list">
      <Group justify="space-between">
        <div>
          <Text className={classes.title}>Topic library</Text>
          <Text className={classes.subtitle}>
            Edit recurrence safely without mixing domain logic into the UI.
          </Text>
        </div>
        <Button radius="md" onClick={onCreate}>
          Add topic
        </Button>
      </Group>
      <Stack mt="lg" gap="sm">
        {activeTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            stats={topicStats[topic.id]}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        ))}
        {archivedTopics.length > 0 && (
          <>
            <Text className={classes.archivedLabel}>Archived topics</Text>
            {archivedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                stats={topicStats[topic.id]}
                onEdit={onEdit}
                onArchive={onArchive}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </Stack>
    </Paper>
  );
}
