import { NextResponse } from "next/server";
import { getUserStatus, recordUserPrediction } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/** 사용자 현재 상태 조회 (오늘 예측 여부 + 누적 기록) */
export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "";
  const status = await getUserStatus(userId);
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

/** 오늘의 예측 1건 기록 */
export async function POST(req: Request) {
  let userId = "";
  let nick = "";
  let side: unknown = null;
  try {
    const body = (await req.json()) as {
      userId?: unknown;
      nick?: unknown;
      side?: unknown;
    };
    userId = typeof body?.userId === "string" ? body.userId : "";
    nick = typeof body?.nick === "string" ? body.nick : "";
    side = body?.side;
  } catch {
    // 파싱 실패 → 아래에서 invalid 로 처리됨
  }

  const result = await recordUserPrediction(
    userId,
    nick,
    side as "LONG" | "SHORT"
  );
  const status = result.reason === "invalid" ? 400 : 200;
  return NextResponse.json(result, { status });
}
