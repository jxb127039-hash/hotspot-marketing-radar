import { RadarDashboard } from "@/components/RadarDashboard";
import { getCachedRadar } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await getCachedRadar();
  return <RadarDashboard snapshot={snapshot} />;
}
