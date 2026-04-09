"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  isMissingTrackerTableError,
  removeEntryForUser,
  removeTopicForUser,
  saveEntryForUser,
  saveTopicForUser,
} from "./lib/persistence.server";
import type { DailyEntry, Topic, TopicMutationInput } from "./lib/types";

const recurrenceSchema = z.object({
  type: z.enum(["daily", "everyXDays", "selectedWeekdays", "weekly", "monthly", "custom"]),
  interval: z.number().int().min(1).optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  unit: z.enum(["day", "week", "month"]).optional(),
});

const topicSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().max(600),
  color: z.string().min(4).max(32),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  archivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  recurrence: recurrenceSchema,
});

const entrySchema = z.object({
  topicId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().min(0).max(100),
  note: z.string().max(1200),
});

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}

export async function saveTopicAction(input: TopicMutationInput): Promise<Topic> {
  const userId = await requireUserId();
  const payload = topicSchema.parse(input);
  try {
    const topic = await saveTopicForUser(userId, payload);
    revalidatePath("/tracker");
    return topic;
  } catch (error) {
    if (isMissingTrackerTableError(error)) {
      throw new Error("Tracker tables are not available yet. Apply the tracker migration first.");
    }
    throw error;
  }
}

export async function deleteTopicAction(topicId: string) {
  const userId = await requireUserId();
  try {
    await removeTopicForUser(userId, topicId);
    revalidatePath("/tracker");
  } catch (error) {
    if (isMissingTrackerTableError(error)) {
      throw new Error("Tracker tables are not available yet. Apply the tracker migration first.");
    }
    throw error;
  }
}

export async function saveEntryAction(input: {
  topicId: string;
  date: string;
  value: number;
  note: string;
}): Promise<DailyEntry> {
  const userId = await requireUserId();
  const payload = entrySchema.parse(input);
  try {
    const entry = await saveEntryForUser(userId, payload);
    revalidatePath("/tracker");
    return entry;
  } catch (error) {
    if (isMissingTrackerTableError(error)) {
      throw new Error("Tracker tables are not available yet. Apply the tracker migration first.");
    }
    throw error;
  }
}

export async function deleteEntryAction(topicId: string, date: string) {
  const userId = await requireUserId();
  try {
    await removeEntryForUser(userId, topicId, date);
    revalidatePath("/tracker");
  } catch (error) {
    if (isMissingTrackerTableError(error)) {
      throw new Error("Tracker tables are not available yet. Apply the tracker migration first.");
    }
    throw error;
  }
}
