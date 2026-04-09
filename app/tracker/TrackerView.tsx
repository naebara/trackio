"use client";

import {
  Alert,
  Box,
  Stack,
} from "@mantine/core";
import { useMemo, useState } from "react";
import CalendarSection from "./components/sections/CalendarSection";
import DayBoardSection from "./components/sections/DayBoardSection";
import HeroSection from "./components/sections/HeroSection";
import InsightsSection from "./components/sections/InsightsSection";
import MatrixSection from "./components/sections/MatrixSection";
import TopicsSection from "./components/sections/TopicsSection";
import EntryFormModal from "./components/EntryFormModal";
import TopicFormModal from "./components/TopicFormModal";
import TrackerShell from "./components/TrackerShell";
import { useTrackerApp } from "./hooks/useTrackerApp";
import classes from "./TrackerView.module.css";
import { addDays, eachDayInRange, todayKey } from "./lib/date";
import { isTopicExpectedOnDate } from "./lib/recurrence";
import type { Topic, TrackerState, TrackerUser } from "./lib/types";

interface TrackerViewProps {
  initialState: TrackerState;
  setupMessage: string | null;
  user?: TrackerUser;
}

export default function TrackerView({
  initialState,
  setupMessage,
  user,
}: TrackerViewProps) {
  const tracker = useTrackerApp(initialState);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [monthKey, setMonthKey] = useState(todayKey());
  const [activeTab, setActiveTab] = useState("today");
  const [topicModalOpened, setTopicModalOpened] = useState(false);
  const [topicModalNonce, setTopicModalNonce] = useState(0);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [entryDraft, setEntryDraft] = useState<{ topic?: Topic; date?: string }>({});
  const [entryModalNonce, setEntryModalNonce] = useState(0);

  const expectedTopicsForSelectedDate = useMemo(
    () => tracker.activeTopics.filter((topic) => isTopicExpectedOnDate(topic, selectedDate)),
    [selectedDate, tracker.activeTopics],
  );
  const matrixDates = useMemo(
    () => eachDayInRange(addDays(selectedDate, -13), selectedDate),
    [selectedDate],
  );
  const monthSummaries = useMemo(
    () => tracker.getMonthSummaries(monthKey),
    [monthKey, tracker],
  );

  function handleSelectedDateChange(date: string) {
    setSelectedDate(date);
    setMonthKey(date);
  }

  function openCreateTopicModal() {
    setEditingTopic(undefined);
    setTopicModalNonce((current) => current + 1);
    setTopicModalOpened(true);
  }

  function openEditTopicModal(topic: Topic) {
    setEditingTopic(topic);
    setTopicModalNonce((current) => current + 1);
    setTopicModalOpened(true);
  }

  function openEntryModal(topic: Topic, date: string) {
    setEntryDraft({ topic, date });
    setEntryModalNonce((current) => current + 1);
  }

  function saveQuickValue(topicId: string, date: string, value: number) {
    const current = tracker.entryMap.get(`${topicId}:${date}`);
    tracker.upsertEntry({
      topicId,
      date,
      value,
      note: current?.note ?? "",
    });
  }

  return (
    <>
      <TrackerShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userLabel={
          user?.name || user?.email ? `User: ${user.name ?? user.email}` : "Authenticated"
        }
      >
        <Stack gap="xl">
          {setupMessage || tracker.errorMessage ? (
            <Alert
              color={setupMessage ? "orange" : "red"}
              radius="lg"
              title={setupMessage ? "Tracker setup required" : "Save failed"}
              withCloseButton={Boolean(tracker.errorMessage)}
              onClose={tracker.errorMessage ? tracker.clearError : undefined}
            >
              {setupMessage ?? tracker.errorMessage}
            </Alert>
          ) : null}

          {activeTab === "today" || activeTab === "calendar" ? (
            <Box className={classes.sectionCard} py="xl">
              <HeroSection
                selectedDate={selectedDate}
                onSelectedDateChange={handleSelectedDateChange}
                onPreviousDay={() => handleSelectedDateChange(addDays(selectedDate, -1))}
                onNextDay={() => handleSelectedDateChange(addDays(selectedDate, 1))}
                onAddTopic={openCreateTopicModal}
                stats={tracker.globalStats}
              />
            </Box>
          ) : null}

          {activeTab === "today" && (
            <Box className={classes.sectionCard}>
              <DayBoardSection
                date={selectedDate}
                topics={expectedTopicsForSelectedDate}
                entryMap={tracker.entryMap}
                onLogValue={saveQuickValue}
                onEditEntry={openEntryModal}
              />
            </Box>
          )}

          {activeTab === "calendar" && (
            <Stack gap="xl">
              <Box className={classes.sectionCard}>
                <CalendarSection
                  monthKey={monthKey}
                  selectedDate={selectedDate}
                  summaries={monthSummaries}
                  onMonthChange={setMonthKey}
                  onSelectDate={handleSelectedDateChange}
                />
              </Box>
              <Box className={classes.sectionCard}>
                <DayBoardSection
                  date={selectedDate}
                  topics={expectedTopicsForSelectedDate}
                  entryMap={tracker.entryMap}
                  onLogValue={saveQuickValue}
                  onEditEntry={openEntryModal}
                />
              </Box>
            </Stack>
          )}

          {activeTab === "matrix" && (
            <Box className={classes.sectionCard}>
              <MatrixSection
                topics={tracker.activeTopics}
                dates={matrixDates}
                entryMap={tracker.entryMap}
                onSelectCell={(topic, date) => {
                  handleSelectedDateChange(date);
                  openEntryModal(topic, date);
                }}
              />
            </Box>
          )}

          {activeTab === "topics" && (
            <Box className={classes.sectionCard}>
              <TopicsSection
                activeTopics={tracker.activeTopics}
                archivedTopics={tracker.archivedTopics}
                topicStats={tracker.topicStats}
                onCreate={openCreateTopicModal}
                onEdit={openEditTopicModal}
                onArchive={tracker.archiveTopic}
                onRestore={tracker.restoreTopic}
                onDelete={tracker.deleteTopic}
              />
            </Box>
          )}

          {activeTab === "insights" && (
            <Box className={classes.sectionCard}>
              <InsightsSection topics={tracker.topics} topicStats={tracker.topicStats} />
            </Box>
          )}
        </Stack>
      </TrackerShell>

      <TopicFormModal
        key={editingTopic?.id ?? `new-${topicModalNonce}`}
        opened={topicModalOpened}
        topic={editingTopic}
        onClose={() => {
          setEditingTopic(undefined);
          setTopicModalOpened(false);
        }}
        onSave={(topic) => {
          tracker.upsertTopic(topic);
          setEditingTopic(undefined);
          setTopicModalOpened(false);
        }}
      />
      <EntryFormModal
        key={
          entryDraft.topic && entryDraft.date
            ? `${entryDraft.topic.id}-${entryDraft.date}-${entryModalNonce}`
            : `entry-${entryModalNonce}`
        }
        opened={Boolean(entryDraft.topic && entryDraft.date)}
        topic={entryDraft.topic}
        date={entryDraft.date}
        entry={
          entryDraft.topic && entryDraft.date
            ? tracker.entryMap.get(`${entryDraft.topic.id}:${entryDraft.date}`)
            : undefined
        }
        onClose={() => setEntryDraft({})}
        onSave={(entry) => {
          tracker.upsertEntry(entry);
          setEntryDraft({});
        }}
        onDelete={(topicId, date) => {
          tracker.deleteEntry(topicId, date);
          setEntryDraft({});
        }}
      />
    </>
  );
}
