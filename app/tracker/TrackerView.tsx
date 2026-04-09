"use client";

import { Container, Group, Stack, Tabs, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { addDays, eachDayInRange, todayKey } from "./lib/date";
import { isTopicExpectedOnDate } from "./lib/recurrence";
import type { Topic, TrackerUser } from "./lib/types";
import { useTrackerApp } from "./hooks/useTrackerApp";
import { trackerText } from "./constants/i18n";
import EntryFormModal from "./components/EntryFormModal";
import TopicFormModal from "./components/TopicFormModal";
import CalendarSection from "./components/sections/CalendarSection";
import DayBoardSection from "./components/sections/DayBoardSection";
import HeroSection from "./components/sections/HeroSection";
import InsightsSection from "./components/sections/InsightsSection";
import MatrixSection from "./components/sections/MatrixSection";
import TopicsSection from "./components/sections/TopicsSection";
import classes from "./TrackerView.module.css";

interface TrackerViewProps {
  user?: TrackerUser;
}

export default function TrackerView({ user }: TrackerViewProps) {
  const tracker = useTrackerApp(user?.id);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [monthKey, setMonthKey] = useState(todayKey());
  const [activeTab, setActiveTab] = useState("today");
  const [topicModalOpened, setTopicModalOpened] = useState(false);
  const [topicModalNonce, setTopicModalNonce] = useState(0);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [entryDraft, setEntryDraft] = useState<{ topic?: Topic; date?: string }>({});
  const [entryModalNonce, setEntryModalNonce] = useState(0);

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

  const expectedTopicsForSelectedDate = useMemo(
    () =>
      tracker.activeTopics.filter((topic) => isTopicExpectedOnDate(topic, selectedDate)),
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
    <div className={classes.page}>
      <Container className={classes.container} size="xl">
        <Stack gap="lg">
          <HeroSection
            selectedDate={selectedDate}
            onSelectedDateChange={handleSelectedDateChange}
            onPreviousDay={() => handleSelectedDateChange(addDays(selectedDate, -1))}
            onNextDay={() => handleSelectedDateChange(addDays(selectedDate, 1))}
            onAddTopic={openCreateTopicModal}
            stats={tracker.globalStats}
          />
          <Group justify="space-between" align="center">
            <div>
              <Text className={classes.pageTitle}>Routine cockpit</Text>
              <Text className={classes.pageSubtitle}>
                {user?.name || user?.email
                  ? `Working locally as ${user.name ?? user.email}.`
                  : "Working locally with seeded demo data. All changes persist in this browser."}
              </Text>
            </div>
          </Group>
          <Tabs
            classNames={{ root: classes.tabsRoot, tab: classes.tab }}
            value={activeTab}
            onChange={(value) => setActiveTab(value ?? "today")}
          >
            <Tabs.List>
              <Tabs.Tab value="today">{trackerText.todayTab}</Tabs.Tab>
              <Tabs.Tab value="calendar">{trackerText.calendarTab}</Tabs.Tab>
              <Tabs.Tab value="matrix">{trackerText.matrixTab}</Tabs.Tab>
              <Tabs.Tab value="topics">{trackerText.topicsTab}</Tabs.Tab>
              <Tabs.Tab value="insights">{trackerText.insightsTab}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="today" pt="lg">
              <DayBoardSection
                date={selectedDate}
                topics={expectedTopicsForSelectedDate}
                entryMap={tracker.entryMap}
                onLogValue={saveQuickValue}
                onEditEntry={(topic, date) => {
                  setEntryDraft({ topic, date });
                  setEntryModalNonce((current) => current + 1);
                }}
              />
            </Tabs.Panel>
            <Tabs.Panel value="calendar" pt="lg">
              <Stack gap="lg">
                <CalendarSection
                  monthKey={monthKey}
                  selectedDate={selectedDate}
                  summaries={monthSummaries}
                  onMonthChange={setMonthKey}
                  onSelectDate={handleSelectedDateChange}
                />
                <DayBoardSection
                  date={selectedDate}
                  topics={expectedTopicsForSelectedDate}
                  entryMap={tracker.entryMap}
                  onLogValue={saveQuickValue}
                  onEditEntry={(topic, date) => {
                    setEntryDraft({ topic, date });
                    setEntryModalNonce((current) => current + 1);
                  }}
                />
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="matrix" pt="lg">
              <MatrixSection
                topics={tracker.activeTopics}
                dates={matrixDates}
                entryMap={tracker.entryMap}
                onSelectCell={(topic, date) => {
                  handleSelectedDateChange(date);
                  setEntryDraft({ topic, date });
                  setEntryModalNonce((current) => current + 1);
                }}
              />
            </Tabs.Panel>
            <Tabs.Panel value="topics" pt="lg">
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
            </Tabs.Panel>
            <Tabs.Panel value="insights" pt="lg">
              <InsightsSection topics={tracker.topics} topicStats={tracker.topicStats} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
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
    </div>
  );
}
