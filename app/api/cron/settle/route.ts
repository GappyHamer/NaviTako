import { NextResponse } from "next/server";
import { settleWindow, statsEnabled } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 만기 예언 정산 백업. Vercel Cron이 하루 1회 호출한다(vercel.json).
 * 평소 갱신은 /api/stats 읽기 시점 정산이 담당하고, 이건 트래픽이 없을 때의 안전망.
 * CRON_SECRET 이 설정돼 있으면 Vercel이 붙여주는 Authorization 헤더를 검증한다.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse("unauthorized", { status: 401 });
    }
  }

  if (!statsEnabled) {
    return NextResponse.json({ ok: true, connected: false });
  }

  await settleWindow("4h", 500);
  await settleWindow("24h", 500);
  return NextResponse.json({ ok: true });
}
