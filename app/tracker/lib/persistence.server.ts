import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { dateKeyToDatabaseDate } from "./dbDate";
import {
  mapEntryFromDatabase,
  mapRecurrenceToDatabase,
  mapTopicFromDatabase,
} from "./mappers";
import type { EntryMutationInput, TopicMutationInput, TrackerState } from "./types";

function emptyTrackerState(): TrackerState {
  return { topics: [], entries: [] };
}

export function isMissingTrackerTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

export async function loadTrackerStateForUser(userId: string) {
  const [topics, entries] = await Promise.all([
    prisma.topic.findMany({
      where: { userId },
      orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
    }),
    prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: [{ date: "asc" }, { topicId: "asc" }],
    }),
  ]);

  return {
    topics: topics.map(mapTopicFromDatabase),
    entries: entries.map(mapEntryFromDatabase),
  };
}

export function getEmptyTrackerState() {
  return emptyTrackerState();
}

export async function saveTopicForUser(userId: string, input: TopicMutationInput) {
  const current = input.id
    ? await prisma.topic.findFirst({ where: { id: input.id, userId } })
    : null;

  const topic = current
    ? await prisma.topic.update({
        where: { id: current.id },
        data: {
          name: input.name.trim(),
          description: input.description.trim(),
          color: input.color,
          startDate: dateKeyToDatabaseDate(input.startDate),
          endDate: input.endDate ? dateKeyToDatabaseDate(input.endDate) : null,
          archivedAt: input.archivedAt ? dateKeyToDatabaseDate(input.archivedAt) : null,
          ...mapRecurrenceToDatabase(input.recurrence),
        },
      })
    : await prisma.topic.create({
        data: {
          userId,
          name: input.name.trim(),
          description: input.description.trim(),
          color: input.color,
          startDate: dateKeyToDatabaseDate(input.startDate),
          endDate: input.endDate ? dateKeyToDatabaseDate(input.endDate) : null,
          archivedAt: input.archivedAt ? dateKeyToDatabaseDate(input.archivedAt) : null,
          ...mapRecurrenceToDatabase(input.recurrence),
        },
      });

  return mapTopicFromDatabase(topic);
}

export async function removeTopicForUser(userId: string, topicId: string) {
  await prisma.topic.deleteMany({
    where: { id: topicId, userId },
  });
}

export async function saveEntryForUser(userId: string, input: EntryMutationInput) {
  const topic = await prisma.topic.findFirst({
    where: { id: input.topicId, userId },
    select: { id: true },
  });

  if (!topic) {
    throw new Error("Topic not found for this user.");
  }

  const entry = await prisma.dailyEntry.upsert({
    where: {
      topicId_date: {
        topicId: input.topicId,
        date: dateKeyToDatabaseDate(input.date),
      },
    },
    update: {
      value: input.value,
      note: input.note.trim(),
    },
    create: {
      userId,
      topicId: input.topicId,
      date: dateKeyToDatabaseDate(input.date),
      value: input.value,
      note: input.note.trim(),
    },
  });

  return mapEntryFromDatabase(entry);
}

export async function removeEntryForUser(userId: string, topicId: string, date: string) {
  await prisma.dailyEntry.deleteMany({
    where: {
      userId,
      topicId,
      date: dateKeyToDatabaseDate(date),
    },
  });
}
