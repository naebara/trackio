"use client";

import { Button, Group, Modal, NumberInput, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";
import { trackerSelectors } from "../constants/selectors";
import { trackerText } from "../constants/i18n";
import { getRecurrenceSummary, isTargetRecurrence } from "../lib/recurrence";
import type { DailyEntry, Topic } from "../lib/types";
import QuickLogActions from "./QuickLogActions";
import classes from "./EntryFormModal.module.css";

interface EntryFormModalProps {
  opened: boolean;
  topic?: Topic;
  date?: string;
  entry?: DailyEntry;
  onClose: () => void;
  onSave: (payload: { topicId: string; date: string; value: number; note: string }) => void;
  onDelete: (topicId: string, date: string) => void;
}

export default function EntryFormModal({
  opened,
  topic,
  date,
  entry,
  onClose,
  onSave,
  onDelete,
}: EntryFormModalProps) {
  const isTargetTopic = topic ? isTargetRecurrence(topic) : false;
  const [value, setValue] = useState(entry?.value ?? 100);
  const [note, setNote] = useState(entry?.note ?? "");

  function handleSave() {
    if (!topic || !date) return;
    onSave({ topicId: topic.id, date, value: Number(value) || 0, note: note.trim() });
  }

  return (
    <Modal
      classNames={{ content: classes.content }}
      data-testid="tracker-entry-modal"
      opened={opened}
      onClose={onClose}
      title={topic ? `${topic.name} entry` : "Daily entry"}
      centered
      radius="md"
      size="md"
    >
      <Stack>
        <Text size="sm" c="dimmed">
          {isTargetTopic
            ? getRecurrenceSummary(topic!)
            : "Missing entries stay neutral in the stats. Only saved values change completion."}
        </Text>
        <Group grow>
          <TextInput label="Date" type="date" value={date ?? ""} readOnly />
          <TextInput label="Topic" value={topic?.name ?? ""} readOnly />
        </Group>
        <QuickLogActions
          onYes={() => setValue(100)}
          onNo={() => setValue(0)}
          onCustom={() => setValue(65)}
        />
        <NumberInput
          label="Completion percentage"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(next) => setValue(Number(next) || 0)}
        />
        <Textarea
          data-testid={trackerSelectors.entryNoteInput}
          label={trackerText.note}
          placeholder={trackerText.notesPlaceholder}
          minRows={4}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
        />
        <Group justify="space-between">
          <Button
            color="red"
            variant="subtle"
            onClick={() => {
              if (topic && date) onDelete(topic.id, date);
            }}
            disabled={!entry}
          >
            {trackerText.deleteEntry}
          </Button>
          <Group>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save entry</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
