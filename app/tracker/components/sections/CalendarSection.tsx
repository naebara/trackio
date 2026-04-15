"use client";

import { ActionIcon, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  addMonths,
  eachDayInRange,
  formatMonthLabel,
  getDayOfWeek,
  getMonthEnd,
  getMonthStart,
} from "../../lib/date";
import type { DaySummary } from "../../lib/types";
import classes from "./CalendarSection.module.css";

interface CalendarSectionProps {
  monthKey: string;
  selectedDate: string;
  summaries: DaySummary[];
  onMonthChange: (monthKey: string) => void;
  onSelectDate: (date: string) => void;
}

const weekdayHeadings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarSection({
  monthKey,
  selectedDate,
  summaries,
  onMonthChange,
  onSelectDate,
}: CalendarSectionProps) {
  const start = getMonthStart(monthKey);
  const end = getMonthEnd(monthKey);
  const summaryMap = new Map(summaries.map((summary) => [summary.date, summary]));
  const monthDates = eachDayInRange(start, end);
  const leadingBlankCells = Array.from({ length: getDayOfWeek(start) }, (_, index) => index);

  return (
    <Paper className={classes.section} radius="md" data-testid="tracker-calendar-grid">
      <Group justify="space-between">
        <div>
          <Text className={classes.title}>Month overview</Text>
          <Text className={classes.subtitle}>
            Click any day to jump the check-in board and edit historical entries.
          </Text>
        </div>
        <Group gap="xs">
          <ActionIcon radius="md" variant="default" onClick={() => onMonthChange(addMonths(monthKey, -1))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text className={classes.monthLabel}>{formatMonthLabel(monthKey)}</Text>
          <ActionIcon radius="md" variant="default" onClick={() => onMonthChange(addMonths(monthKey, 1))}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
      </Group>
      <SimpleGrid cols={7} mt="lg" spacing="xs">
        {weekdayHeadings.map((heading) => (
          <Text key={heading} className={classes.heading}>
            {heading}
          </Text>
        ))}
        {leadingBlankCells.map((index) => (
          <div key={`blank-${index}`} className={classes.blank} />
        ))}
        {monthDates.map((date) => {
          const summary = summaryMap.get(date);
          const isSelected = selectedDate === date;

          return (
            <button
              key={date}
              className={classes.day}
              data-selected={isSelected}
              onClick={() => onSelectDate(date)}
              type="button"
            >
              <Stack gap={2}>
                <Text className={classes.dayNumber}>{Number(date.slice(-2))}</Text>
                <Text className={classes.dayMetric}>{summary?.expectedCount ?? 0} expected</Text>
                <Text className={classes.dayMetric}>{summary?.loggedCount ?? 0} logged</Text>
                <Text className={classes.dayMetric}>{summary?.averageLoggedValue ?? 0} avg</Text>
              </Stack>
            </button>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
}
