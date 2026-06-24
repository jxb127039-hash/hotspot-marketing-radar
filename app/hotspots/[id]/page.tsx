import { notFound } from "next/navigation";
import { HotspotDetail } from "@/components/HotspotDetail";
import { getCachedRadar } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function HotspotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getCachedRadar();
  const item = snapshot.items.find((entry) => entry.event.id === id);

  if (!item) {
    notFound();
  }

  return <HotspotDetail item={item} />;
}
