import { auth } from "@/auth";
import {
  getEmptyTrackerState,
  isMissingTrackerTableError,
  loadTrackerStateForUser,
} from "./lib/persistence.server";
import TrackerView from "./TrackerView";

export default async function TrackerPage() {
  const session = await auth();
  const userId = session?.user?.id;
  let initialState = getEmptyTrackerState();
  let setupMessage: string | null = null;

  if (userId) {
    try {
      initialState = await loadTrackerStateForUser(userId);
    } catch (error) {
      if (isMissingTrackerTableError(error)) {
        setupMessage =
          "Tracker tables are not in the database yet. Run db:generate, then create and apply the tracker migration.";
      } else {
        setupMessage = "Tracker data could not be loaded right now.";
      }
    }
  }

  return (
    <TrackerView
      initialState={initialState}
      setupMessage={setupMessage}
      user={
        session?.user
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
            }
          : undefined
      }
    />
  );
}
