import { notFound } from "next/navigation";
import { HotspotDetail } from "@/components/HotspotDetail";
import { getCachedRadar } from "@/lib/cache";

export async function generateStaticParams() {
  const snapshot = await getCachedRadar();
  return snapshot.items.map((entry) => ({
    id: entry.event.id
  }));
}

export default async function HotspotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getCachedRadar();
  const item = snapshot.items.find((entry) => entry.event.id === id);

  if (!item) {
    notFound();
  }

  return <HotspotDetail item={item} />;
}
