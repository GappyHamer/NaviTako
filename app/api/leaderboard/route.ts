import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/** 리더보드 상위 N + 내 순위 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const sort = params.get("sort") === "acc" ? "acc" : "streak";
  const me = params.get("me");
  const payload = await getLeaderboard(sort, me || undefined);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
