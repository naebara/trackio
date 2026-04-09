import { demoTrackerState } from "../constants/demoData";
import type { TrackerState } from "./types";

const STORAGE_PREFIX = "trackio:routines:v1";

export function getStorageKey(userId?: string) {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

export function getInitialTrackerState(): TrackerState {
  return structuredClone(demoTrackerState);
}

export function loadTrackerState(userId?: string) {
  if (typeof window === "undefined") return getInitialTrackerState();

  const stored = window.localStorage.getItem(getStorageKey(userId));
  if (!stored) return getInitialTrackerState();

  try {
    return JSON.parse(stored) as TrackerState;
  } catch {
    return getInitialTrackerState();
  }
}

export function saveTrackerState(state: TrackerState, userId?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
}
