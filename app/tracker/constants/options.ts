export const recurrenceOptions = [
  { value: "daily", label: "Daily" },
  { value: "everyXDays", label: "Every X days" },
  { value: "selectedWeekdays", label: "Selected weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom recurrence" },
] as const;

export const weekdayOptions = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
] as const;

export const recurrenceUnits = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
] as const;

export const topicColorOptions = [
  "#3f8f68",
  "#2269c8",
  "#8f5bd3",
  "#d97706",
  "#0f766e",
  "#9f1239",
  "#475569",
  "#7c3aed",
] as const;
