import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { recordPrediction, getPlayerState, TIMEFRAMES } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/** 로그인 플레이어의 현재 상태(시간대별 기록 + 열린 기간 선택 여부) 조회 */
export async function GET(req: NextRequest) {
  const s = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) {
    return NextResponse.json(
      { loggedIn: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  const userId = "g:" + s.sub;
  const state = await getPlayerState(userId);
  return NextResponse.json(
    { loggedIn: true, name: s.name, picture: s.picture, ...state },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** 특정 시간대에 오늘의 예측 1건 기록 (기간당 1회 잠금) */
export async function POST(req: NextRequest) {
  const s = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) {
    return NextResponse.json({ ok: false, reason: "login" }, { status: 401 });
  }

  let tf: unknown = null;
  let side: unknown = null;
  try {
    const body = (await req.json()) as { tf?: unknown; side?: unknown };
    tf = body?.tf;
    side = body?.side;
  } catch {
    // 파싱 실패 → 아래에서 invalid 로 처리됨
  }

  const r = await recordPrediction(
    "g:" + s.sub,
    { nick: s.name, pic: s.picture },
    tf as (typeof TIMEFRAMES)[number],
    side as "LONG" | "SHORT"
  );
  return NextResponse.json(r, { status: r.reason === "invalid" ? 400 : 200 });
}
