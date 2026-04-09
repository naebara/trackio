import { auth } from "@/auth";
import TrackerView from "./TrackerView";

export default async function TrackerPage() {
  const session = await auth();

  return (
    <TrackerView
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
