"use client";

import { useMemo, useReducer, useState, useTransition } from "react";
import {
  deleteEntryAction,
  deleteTopicAction,
  saveEntryAction,
  saveTopicAction,
} from "../actions";
import { addDays, eachDayInRange, getMonthEnd, getMonthStart, todayKey } from "../lib/date";
import { isTopicExpectedOnDate } from "../lib/recurrence";
import { trackerReducer } from "../lib/reducer";
import {
  buildDaySummaries,
  calculateGlobalStats,
  calculateTopicStats,
  createEntryMap,
} from "../lib/stats";
import type { EntryMutationInput, TopicMutationInput, TrackerState } from "../lib/types";

export function useTrackerApp(initialState: TrackerState) {
  const [state, dispatch] = useReducer(trackerReducer, initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function clearError() {
    setErrorMessage(null);
  }

  function upsertTopic(input: TopicMutationInput) {
    clearError();
    startTransition(async () => {
      try {
        const topic = await saveTopicAction(input);
        dispatch({ type: "upsertTopic", payload: topic });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to save topic.");
      }
    });
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
    clearError();
    startTransition(async () => {
      try {
        await deleteTopicAction(topicId);
        dispatch({ type: "deleteTopic", payload: { topicId } });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to delete topic.");
      }
    });
  }

  function upsertEntry(input: EntryMutationInput) {
    clearError();
    startTransition(async () => {
      try {
        const entry = await saveEntryAction({
          ...input,
          value: Math.max(0, Math.min(100, input.value)),
        });
        dispatch({ type: "upsertEntry", payload: entry });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to save entry.");
      }
    });
  }

  function deleteEntry(topicId: string, date: string) {
    clearError();
    startTransition(async () => {
      try {
        await deleteEntryAction(topicId, date);
        dispatch({ type: "deleteEntry", payload: { topicId, date } });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to delete entry.");
      }
    });
  }

  function getMonthSummaries(monthKey: string) {
    const dates = eachDayInRange(getMonthStart(monthKey), getMonthEnd(monthKey));
    return buildDaySummaries(activeTopics, state.entries, dates);
  }

  return {
    topics: state.topics,
    entries: state.entries,
    isPending,
    errorMessage,
    clearError,
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
