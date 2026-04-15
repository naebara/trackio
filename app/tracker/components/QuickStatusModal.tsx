"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackerSelectors } from "../constants/selectors";
import { trackerText } from "../constants/i18n";
import {
  getRecurrenceSummary,
  isTargetRecurrence,
} from "../lib/recurrence";
import type { DailyEntry, Topic } from "../lib/types";
import classes from "./QuickStatusModal.module.css";

interface QuickStatusModalProps {
  opened: boolean;
  topic?: Topic;
  date?: string;
  entry?: DailyEntry;
  onClose: () => void;
  onSave: (topicId: string, date: string, value: number, note: string) => void;
  onClear: (topicId: string, date: string) => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 42;

function getRingColor(value: number): string {
  if (value >= 50) return "var(--accent-green, #22c55e)";
  if (value > 0) return "var(--accent-orange, #f59e0b)";
  return "var(--accent-red, #ef4444)";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
}

export default function QuickStatusModal({
  opened,
  topic,
  date,
  entry,
  onClose,
  onSave,
  onClear,
}: QuickStatusModalProps) {
  const isTargetTopic = topic ? isTargetRecurrence(topic) : false;
  const [value, setValue] = useState(entry?.value ?? 100);
  const [note, setNote] = useState(entry?.note ?? "");

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleSave = useCallback(() => {
    if (topic && date) onSave(topic.id, date, value, note.trim());
  }, [topic, date, value, note, onSave]);

  const handleClear = useCallback(() => {
    if (topic && date) onClear(topic.id, date);
  }, [topic, date, onClear]);

  useEffect(() => {
    if (!opened) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [opened, onClose]);

  if (!opened || !topic || !date) return null;

  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
  const recurrenceHint = isTargetTopic ? getRecurrenceSummary(topic) : null;

  const modal = (
    <div
      className={classes.overlay}
      onClick={handleOverlayClick}
      data-testid={trackerSelectors.quickStatusModal}
    >
      <div className={classes.sheet}>
        <div className={classes.handle} />

        <div className={classes.topicHeader}>
          <span className={classes.dot} style={{ backgroundColor: topic.color }} />
          <span className={classes.topicName}>{topic.name}</span>
          <span className={classes.dateLabel}>{formatDate(date)}</span>
        </div>

        <div className={classes.preview}>
          <div className={classes.ringWrapper}>
            <svg className={classes.ringSvg} viewBox="0 0 100 100">
              <circle className={classes.ringTrack} cx="50" cy="50" r="42" />
              <circle
                className={classes.ringFill}
                cx="50"
                cy="50"
                r="42"
                stroke={getRingColor(value)}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
              />
            </svg>
            <span className={classes.ringLabel}>{value}%</span>
          </div>
          {recurrenceHint && <span className={classes.previewHint}>{recurrenceHint}</span>}
        </div>

        <div className={classes.quickButtons}>
          <>
            <button
              type="button"
              className={`${classes.quickBtn} ${classes.yesBtn}`}
              data-selected={value === 100}
              onClick={() => setValue(100)}
            >
              ✓ {trackerText.yes}
            </button>
            <button
              type="button"
              className={`${classes.quickBtn} ${classes.noBtn}`}
              data-selected={value === 0}
              onClick={() => setValue(0)}
            >
              ✗ {trackerText.no}
            </button>
          </>
        </div>

        <div className={classes.sliderSection}>
          <div className={classes.sliderLabel}>{trackerText.custom}</div>
          <input
            type="range"
            className={classes.slider}
            min={0}
            max={100}
            step={5}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </div>

        <div className={classes.noteSection}>
          <label className={classes.noteLabel} htmlFor="tracker-quick-note">
            {trackerText.note}
          </label>
          <textarea
            id="tracker-quick-note"
            data-testid={trackerSelectors.quickStatusNoteInput}
            className={classes.noteInput}
            rows={3}
            value={note}
            placeholder={trackerText.notesPlaceholder}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
        </div>

        <div className={classes.actions}>
          <button type="button" className={classes.cancelBtn} onClick={onClose}>
            {trackerText.cancel}
          </button>
          <button type="button" className={classes.saveBtn} onClick={handleSave}>
            {trackerText.save}
          </button>
          <button
            type="button"
            className={classes.clearBtn}
            onClick={handleClear}
            disabled={!entry}
          >
            {trackerText.deleteEntry}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
