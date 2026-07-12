import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getLeaderboard, TIMEFRAMES } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/** 리더보드 상위 N + 내 순위 (시간대 key + 정렬 sort) */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const rawKey = sp.get("key") ?? "all";
  const key =
    rawKey === "all" || (TIMEFRAMES as readonly string[]).includes(rawKey)
      ? (rawKey as Parameters<typeof getLeaderboard>[0])
      : "all";

  const sort = sp.get("sort") === "streak" ? "streak" : "acc";

  const s = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const me = s ? "g:" + s.sub : undefined;

  const data = await getLeaderboard(key, sort, me);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
