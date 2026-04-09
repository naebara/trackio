export type RecurrenceType =
  | "daily"
  | "everyXDays"
  | "selectedWeekdays"
  | "weekly"
  | "monthly"
  | "custom";

export type RecurrenceUnit = "day" | "week" | "month";

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number;
  weekdays?: number[];
  dayOfWeek?: number;
  dayOfMonth?: number;
  unit?: RecurrenceUnit;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  startDate: string;
  endDate?: string | null;
  archivedAt?: string | null;
  recurrence: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface DailyEntry {
  id: string;
  topicId: string;
  date: string;
  value: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerState {
  topics: Topic[];
  entries: DailyEntry[];
}

export interface TopicMutationInput {
  id?: string;
  name: string;
  description: string;
  color: string;
  startDate: string;
  endDate?: string | null;
  archivedAt?: string | null;
  recurrence: RecurrenceRule;
}

export interface EntryMutationInput {
  topicId: string;
  date: string;
  value: number;
  note: string;
}

export interface TrackerUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export interface TopicStats {
  expectedDays: number;
  loggedDays: number;
  pendingDays: number;
  averageLoggedValue: number;
  coverageRate: number;
  fullSuccessDays: number;
  currentRecordedStreak: number;
}

export interface DaySummary {
  date: string;
  expectedCount: number;
  loggedCount: number;
  pendingCount: number;
  averageLoggedValue: number;
}

export interface TopicCell {
  date: string;
  expected: boolean;
  topicActive: boolean;
  entry?: DailyEntry;
  state: "none" | "upcoming" | "pending" | "logged";
}
