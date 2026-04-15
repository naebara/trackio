"use client";

import { ActionIcon, Group, SimpleGrid, Text } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconPlus } from "@tabler/icons-react";
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
    <div className={classes.hero} data-testid={trackerSelectors.shell}>
      <Group className={classes.toolbar} justify="space-between" align="center" gap="md">
        <div>
          <Text className={classes.dateLabel}>{isToday ? "Today focus" : "Selected day"}</Text>
          <Text className={classes.dateValue}>{formatDayLabel(selectedDate)}</Text>
        </div>
        <Group gap="sm">
          <ActionIcon.Group>
            <ActionIcon radius="md" variant="default" onClick={onPreviousDay}>
              <IconArrowLeft size={16} />
            </ActionIcon>
            <ActionIcon
              radius="md"
              variant="filled"
              color="blue"
              data-testid={trackerSelectors.addTopicButton}
              onClick={onAddTopic}
            >
              <IconPlus size={16} />
            </ActionIcon>
            <ActionIcon radius="md" variant="default" onClick={onNextDay}>
              <IconArrowRight size={16} />
            </ActionIcon>
          </ActionIcon.Group>
          <input
            aria-label="Selected date"
            className={classes.dateInput}
            type="date"
            value={selectedDate}
            onChange={(event) => onSelectedDateChange(event.currentTarget.value)}
          />
        </Group>
      </Group>
      <SimpleGrid cols={{ base: 2, md: 5 }} spacing="sm">
        <StatCard label={trackerText.expectedDays} value={`${stats.expectedDays}`} />
        <StatCard label={trackerText.loggedDays} value={`${stats.loggedDays}`} tone="success" />
        <StatCard label={trackerText.pendingDays} value={`${stats.pendingDays}`} tone="warning" />
        <StatCard label={trackerText.avgValue} value={`${stats.averageLoggedValue}%`} />
        <StatCard label={trackerText.coverage} value={`${stats.coverageRate}%`} />
      </SimpleGrid>
    </div>
  );
}
