import { auth } from "@/auth";
import DashboardView from "./DashboardView";

export default async function Home() {
  const session = await auth();

  return <DashboardView user={session?.user} />;
}
