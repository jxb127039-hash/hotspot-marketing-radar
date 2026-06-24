import { NextResponse } from "next/server";
import { getCachedRadar } from "@/lib/cache";

export async function GET() {
  const snapshot = await getCachedRadar();
  return NextResponse.json(snapshot);
}
