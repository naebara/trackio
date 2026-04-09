import {
  TopicRecurrenceType,
  TopicRecurrenceUnit,
  type DailyEntry as PrismaDailyEntry,
  type Topic as PrismaTopic,
} from "@prisma/client";
import { databaseDateToDateKey } from "./dbDate";
import type {
  DailyEntry,
  RecurrenceRule,
  RecurrenceType,
  RecurrenceUnit,
  Topic,
} from "./types";

const recurrenceTypeFromPrisma: Record<TopicRecurrenceType, RecurrenceType> = {
  DAILY: "daily",
  EVERY_X_DAYS: "everyXDays",
  SELECTED_WEEKDAYS: "selectedWeekdays",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  CUSTOM: "custom",
};

const recurrenceTypeToPrisma: Record<RecurrenceType, TopicRecurrenceType> = {
  daily: TopicRecurrenceType.DAILY,
  everyXDays: TopicRecurrenceType.EVERY_X_DAYS,
  selectedWeekdays: TopicRecurrenceType.SELECTED_WEEKDAYS,
  weekly: TopicRecurrenceType.WEEKLY,
  monthly: TopicRecurrenceType.MONTHLY,
  custom: TopicRecurrenceType.CUSTOM,
};

const recurrenceUnitFromPrisma: Record<TopicRecurrenceUnit, RecurrenceUnit> = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

const recurrenceUnitToPrisma: Record<RecurrenceUnit, TopicRecurrenceUnit> = {
  day: TopicRecurrenceUnit.DAY,
  week: TopicRecurrenceUnit.WEEK,
  month: TopicRecurrenceUnit.MONTH,
};

export function mapTopicFromDatabase(topic: PrismaTopic): Topic {
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    color: topic.color,
    startDate: databaseDateToDateKey(topic.startDate),
    endDate: topic.endDate ? databaseDateToDateKey(topic.endDate) : null,
    archivedAt: topic.archivedAt ? databaseDateToDateKey(topic.archivedAt) : null,
    recurrence: {
      type: recurrenceTypeFromPrisma[topic.recurrenceType],
      interval: topic.recurrenceInterval ?? undefined,
      weekdays: topic.recurrenceWeekdays,
      dayOfWeek: topic.recurrenceDayOfWeek ?? undefined,
      dayOfMonth: topic.recurrenceDayOfMonth ?? undefined,
      unit: topic.recurrenceUnit
        ? recurrenceUnitFromPrisma[topic.recurrenceUnit]
        : undefined,
    },
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  };
}

export function mapEntryFromDatabase(entry: PrismaDailyEntry): DailyEntry {
  return {
    id: entry.id,
    topicId: entry.topicId,
    date: databaseDateToDateKey(entry.date),
    value: entry.value,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function mapRecurrenceToDatabase(rule: RecurrenceRule) {
  return {
    recurrenceType: recurrenceTypeToPrisma[rule.type],
    recurrenceInterval: rule.interval ?? null,
    recurrenceWeekdays: rule.weekdays ?? [],
    recurrenceDayOfWeek: rule.dayOfWeek ?? null,
    recurrenceDayOfMonth: rule.dayOfMonth ?? null,
    recurrenceUnit: rule.unit ? recurrenceUnitToPrisma[rule.unit] : null,
  };
}
