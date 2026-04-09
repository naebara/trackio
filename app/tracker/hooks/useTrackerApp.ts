"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { addDays, eachDayInRange, getMonthEnd, getMonthStart, todayKey } from "../lib/date";
import { trackerReducer } from "../lib/reducer";
import { createEntryMap, calculateGlobalStats, calculateTopicStats, buildDaySummaries } from "../lib/stats";
import { getInitialTrackerState, loadTrackerState, saveTrackerState } from "../lib/storage";
import { isTopicExpectedOnDate } from "../lib/recurrence";
import type { DailyEntry, Topic } from "../lib/types";

interface TopicInput extends Omit<Topic, "id" | "createdAt" | "updatedAt"> {
  id?: string;
}

interface EntryInput {
  topicId: string;
  date: string;
  value: number;
  note: string;
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function useTrackerApp(userId?: string) {
  const hasLoadedRef = useRef(false);
  const [state, dispatch] = useReducer(trackerReducer, getInitialTrackerState());

  useEffect(() => {
    dispatch({ type: "hydrate", payload: loadTrackerState(userId) });
    hasLoadedRef.current = true;
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveTrackerState(state, userId);
  }, [state, userId]);

  const entryMap = useMemo(() => createEntryMap(state.entries), [state.entries]);
  const today = todayKey();
  const rangeStart = addDays(today, -29);
  const rollingDates = useMemo(() => eachDayInRange(rangeStart, today), [rangeStart, today]);
  const activeTopics = useMemo(
    () => state.topics.filter((topic) => !topic.archivedAt),
    [state.topics],
  );
  const archivedTopics = useMemo(
    () => state.topics.filter((topic) => Boolean(topic.archivedAt)),
    [state.topics],
  );
  const todayTopics = useMemo(
    () => activeTopics.filter((topic) => isTopicExpectedOnDate(topic, today)),
    [activeTopics, today],
  );
  const globalStats = useMemo(
    () => calculateGlobalStats(activeTopics, state.entries, rangeStart, today),
    [activeTopics, rangeStart, state.entries, today],
  );

  const topicStats = useMemo(
    () =>
      Object.fromEntries(
        state.topics.map((topic) => [topic.id, calculateTopicStats(topic, rollingDates, entryMap)]),
      ),
    [entryMap, rollingDates, state.topics],
  );

  function upsertTopic(input: TopicInput) {
    const now = new Date().toISOString();
    const topic: Topic = {
      ...input,
      id: input.id ?? createId("topic"),
      createdAt: input.id
        ? state.topics.find((topicItem) => topicItem.id === input.id)?.createdAt ?? now
        : now,
      updatedAt: now,
    };

    dispatch({ type: "upsertTopic", payload: topic });
  }

  function archiveTopic(topicId: string) {
    const current = state.topics.find((topic) => topic.id === topicId);
    if (!current) return;

    upsertTopic({ ...current, archivedAt: today });
  }

  function restoreTopic(topicId: string) {
    const current = state.topics.find((topic) => topic.id === topicId);
    if (!current) return;

    upsertTopic({ ...current, archivedAt: null });
  }

  function deleteTopic(topicId: string) {
    dispatch({ type: "deleteTopic", payload: { topicId } });
  }

  function upsertEntry(input: EntryInput) {
    const now = new Date().toISOString();
    const current = entryMap.get(`${input.topicId}:${input.date}`);
    const value = Math.max(0, Math.min(100, input.value));

    const entry: DailyEntry = {
      id: current?.id ?? createId("entry"),
      topicId: input.topicId,
      date: input.date,
      value,
      note: input.note,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };

    dispatch({ type: "upsertEntry", payload: entry });
  }

  function deleteEntry(topicId: string, date: string) {
    dispatch({ type: "deleteEntry", payload: { topicId, date } });
  }

  function getMonthSummaries(monthKey: string) {
    const dates = eachDayInRange(getMonthStart(monthKey), getMonthEnd(monthKey));
    return buildDaySummaries(activeTopics, state.entries, dates);
  }

  return {
    topics: state.topics,
    entries: state.entries,
    entryMap,
    activeTopics,
    archivedTopics,
    today,
    todayTopics,
    globalStats,
    topicStats,
    upsertTopic,
    archiveTopic,
    restoreTopic,
    deleteTopic,
    upsertEntry,
    deleteEntry,
    getMonthSummaries,
  };
}
