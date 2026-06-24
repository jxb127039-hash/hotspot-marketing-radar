import { unstable_cache } from "next/cache";
import { buildDailyRadar } from "@/lib/radar";

export const getCachedRadar = unstable_cache(buildDailyRadar, ["public-hotspot-radar-v2"], {
  revalidate: 60 * 60 * 4,
  tags: ["public-hotspot-radar"]
});
