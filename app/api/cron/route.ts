import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCachedRadar } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("public-hotspot-radar", { expire: 0 });
  const snapshot = await getCachedRadar();

  return NextResponse.json({
    ok: true,
    generatedAt: snapshot.generatedAt,
    itemCount: snapshot.items.length,
    dataMode: snapshot.dataMode
  });
}
