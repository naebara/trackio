"use client";

import { ActionIcon, Group, Paper, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconBolt, IconPlus } from "@tabler/icons-react";
import { formatDayLabel, todayKey } from "../../lib/date";
import { trackerText } from "../../constants/i18n";
import { trackerSelectors } from "../../constants/selectors";
import StatCard from "../StatCard";
import classes from "./HeroSection.module.css";

interface HeroSectionProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onAddTopic: () => void;
  stats: {
    expectedDays: number;
    loggedDays: number;
    pendingDays: number;
    averageLoggedValue: number;
    coverageRate: number;
  };
}

export default function HeroSection({
  selectedDate,
  onSelectedDateChange,
  onPreviousDay,
  onNextDay,
  onAddTopic,
  stats,
}: HeroSectionProps) {
  const isToday = selectedDate === todayKey();

  return (
    <Paper className={classes.hero} data-testid={trackerSelectors.shell} radius="xl">
      <Group justify="space-between" align="flex-start" gap="xl">
        <div className={classes.copy}>
          <ThemeIcon size={46} radius="xl" className={classes.icon}>
            <IconBolt size={24} />
          </ThemeIcon>
          <Text className={classes.eyebrow}>{trackerText.appName}</Text>
          <Text className={classes.title}>{trackerText.title}</Text>
          <Text className={classes.subtitle}>{trackerText.subtitle}</Text>
        </div>
        <ActionIcon.Group>
          <ActionIcon radius="xl" variant="white" onClick={onPreviousDay}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <ActionIcon
            radius="xl"
            variant="filled"
            color="dark"
            data-testid={trackerSelectors.addTopicButton}
            onClick={onAddTopic}
          >
            <IconPlus size={18} />
          </ActionIcon>
          <ActionIcon radius="xl" variant="white" onClick={onNextDay}>
            <IconArrowRight size={18} />
          </ActionIcon>
        </ActionIcon.Group>
      </Group>
      <Group className={classes.filters} justify="space-between" align="center">
        <div>
          <Text className={classes.dateLabel}>{isToday ? "Today focus" : "Selected day"}</Text>
          <Text className={classes.dateValue}>{formatDayLabel(selectedDate)}</Text>
        </div>
        <input
          aria-label="Selected date"
          className={classes.dateInput}
          type="date"
          value={selectedDate}
          onChange={(event) => onSelectedDateChange(event.currentTarget.value)}
        />
      </Group>
      <SimpleGrid cols={{ base: 2, md: 5 }} spacing="sm">
        <StatCard label="Expected days" value={`${stats.expectedDays}`} />
        <StatCard label="Logged days" value={`${stats.loggedDays}`} tone="success" />
        <StatCard label="Missing logs" value={`${stats.pendingDays}`} tone="warning" />
        <StatCard label="Avg. logged %" value={`${stats.averageLoggedValue}%`} />
        <StatCard label="Coverage" value={`${stats.coverageRate}%`} />
      </SimpleGrid>
    </Paper>
  );
}
