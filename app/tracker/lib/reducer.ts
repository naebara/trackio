import type { DailyEntry, Topic, TrackerState } from "./types";

type TrackerAction =
  | { type: "hydrate"; payload: TrackerState }
  | { type: "upsertTopic"; payload: Topic }
  | { type: "deleteTopic"; payload: { topicId: string } }
  | { type: "upsertEntry"; payload: DailyEntry }
  | { type: "deleteEntry"; payload: { topicId: string; date: string } };

function sortTopics(topics: Topic[]) {
  return [...topics].sort((left, right) => left.name.localeCompare(right.name));
}

function sortEntries(entries: DailyEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date === right.date) return left.topicId.localeCompare(right.topicId);
    return left.date.localeCompare(right.date);
  });
}

export function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "upsertTopic": {
      const withoutCurrent = state.topics.filter((topic) => topic.id !== action.payload.id);
      return { ...state, topics: sortTopics([...withoutCurrent, action.payload]) };
    }
    case "deleteTopic":
      return {
        topics: state.topics.filter((topic) => topic.id !== action.payload.topicId),
        entries: state.entries.filter((entry) => entry.topicId !== action.payload.topicId),
      };
    case "upsertEntry": {
      const withoutCurrent = state.entries.filter(
        (entry) =>
          !(entry.topicId === action.payload.topicId && entry.date === action.payload.date),
      );

      return { ...state, entries: sortEntries([...withoutCurrent, action.payload]) };
    }
    case "deleteEntry":
      return {
        ...state,
        entries: state.entries.filter(
          (entry) =>
            !(
              entry.topicId === action.payload.topicId && entry.date === action.payload.date
            ),
        ),
      };
    default:
      return state;
  }
}

export type { TrackerAction };
