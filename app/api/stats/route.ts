import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

// 읽기 시점에 지연 정산이 일어나므로 항상 동적 실행.
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, {
    headers: { "Cache-Control": "no-store" },
  });
}
