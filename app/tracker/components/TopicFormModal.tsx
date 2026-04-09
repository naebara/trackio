"use client";

import {
  Button,
  Checkbox,
  ColorInput,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useState } from "react";
import { recurrenceOptions, recurrenceUnits, topicColorOptions, weekdayOptions } from "../constants/options";
import { todayKey } from "../lib/date";
import type { RecurrenceRule, Topic } from "../lib/types";
import classes from "./TopicFormModal.module.css";

interface TopicFormModalProps {
  opened: boolean;
  topic?: Topic;
  onClose: () => void;
  onSave: (topic: Omit<Topic, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
}

function getInitialRecurrence(topic?: Topic): RecurrenceRule {
  return topic?.recurrence ?? { type: "daily" };
}

export default function TopicFormModal({
  opened,
  topic,
  onClose,
  onSave,
}: TopicFormModalProps) {
  const initialTopicState = topic ?? null;
  const [name, setName] = useState(initialTopicState?.name ?? "");
  const [description, setDescription] = useState(initialTopicState?.description ?? "");
  const [color, setColor] = useState<string>(initialTopicState?.color ?? topicColorOptions[0]);
  const [startDate, setStartDate] = useState(initialTopicState?.startDate ?? todayKey());
  const [endDate, setEndDate] = useState(initialTopicState?.endDate ?? "");
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    getInitialRecurrence(initialTopicState ?? undefined),
  );

  function handleSave() {
    if (!name.trim()) return;

    onSave({
      id: topic?.id,
      name: name.trim(),
      description: description.trim(),
      color,
      startDate,
      endDate: endDate || null,
      archivedAt: topic?.archivedAt ?? null,
      recurrence,
    });
  }

  return (
    <Modal
      classNames={{ content: classes.content }}
      data-testid="tracker-topic-modal"
      opened={opened}
      onClose={onClose}
      title={topic ? "Edit topic" : "Create topic"}
      centered
      radius="xl"
      size="lg"
    >
      <Stack>
        <TextInput
          label="Topic name"
          placeholder="Healthy Eating"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <Textarea
          label="Description"
          placeholder="Optional framing for what a good day means."
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        <Group grow align="start">
          <ColorInput
            label="Color"
            format="hex"
            swatches={topicColorOptions as unknown as string[]}
            value={color}
            onChange={setColor}
          />
          <Select
            label="Recurrence"
            value={recurrence.type}
            data={recurrenceOptions as unknown as { value: string; label: string }[]}
            onChange={(value) =>
              setRecurrence({ type: (value as RecurrenceRule["type"]) ?? "daily" })
            }
          />
        </Group>
        <Group grow align="start">
          <TextInput
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
          />
          <TextInput
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.currentTarget.value)}
          />
        </Group>
        {recurrence.type === "everyXDays" && (
          <NumberInput
            label="Repeat interval in days"
            min={1}
            value={recurrence.interval ?? 2}
            onChange={(value) =>
              setRecurrence({ type: "everyXDays", interval: Number(value) || 1 })
            }
          />
        )}
        {recurrence.type === "selectedWeekdays" && (
          <Checkbox.Group
            label="Expected weekdays"
            value={(recurrence.weekdays ?? []).map(String)}
            onChange={(value) =>
              setRecurrence({
                type: "selectedWeekdays",
                weekdays: value.map(Number),
              })
            }
          >
            <Group mt="xs">
              {weekdayOptions.map((weekday) => (
                <Checkbox key={weekday.value} value={weekday.value} label={weekday.label} />
              ))}
            </Group>
          </Checkbox.Group>
        )}
        {recurrence.type === "weekly" && (
          <Select
            label="Weekday"
            value={`${recurrence.dayOfWeek ?? 1}`}
            data={weekdayOptions as unknown as { value: string; label: string }[]}
            onChange={(value) =>
              setRecurrence({ type: "weekly", dayOfWeek: Number(value ?? 1) })
            }
          />
        )}
        {recurrence.type === "monthly" && (
          <NumberInput
            label="Day of month"
            min={1}
            max={31}
            value={recurrence.dayOfMonth ?? 1}
            onChange={(value) =>
              setRecurrence({ type: "monthly", dayOfMonth: Number(value) || 1 })
            }
          />
        )}
        {recurrence.type === "custom" && (
          <Group grow align="start">
            <NumberInput
              label="Interval"
              min={1}
              value={recurrence.interval ?? 2}
              onChange={(value) =>
                setRecurrence({
                  ...recurrence,
                  type: "custom",
                  interval: Number(value) || 1,
                  unit: recurrence.unit ?? "week",
                })
              }
            />
            <Select
              label="Unit"
              value={recurrence.unit ?? "week"}
              data={recurrenceUnits as unknown as { value: string; label: string }[]}
              onChange={(value) =>
                setRecurrence({
                  ...recurrence,
                  type: "custom",
                  unit: (value as RecurrenceRule["unit"]) ?? "week",
                })
              }
            />
            {(recurrence.unit ?? "week") === "week" && (
              <Select
                label="Weekday"
                value={`${recurrence.dayOfWeek ?? 1}`}
                data={weekdayOptions as unknown as { value: string; label: string }[]}
                onChange={(value) =>
                  setRecurrence({
                    ...recurrence,
                    type: "custom",
                    dayOfWeek: Number(value ?? 1),
                  })
                }
              />
            )}
            {(recurrence.unit ?? "week") === "month" && (
              <NumberInput
                label="Day of month"
                min={1}
                max={31}
                value={recurrence.dayOfMonth ?? 1}
                onChange={(value) =>
                  setRecurrence({
                    ...recurrence,
                    type: "custom",
                    dayOfMonth: Number(value) || 1,
                  })
                }
              />
            )}
          </Group>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save topic</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
