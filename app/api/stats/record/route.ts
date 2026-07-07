import { NextResponse } from "next/server";
import { getCurrentPrice, recordDraw, statsEnabled } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!statsEnabled) {
    // 저장소 미연결 → 조용히 성공 처리 (클라이언트는 신경 쓸 필요 없음)
    return NextResponse.json({ ok: true, connected: false });
  }

  let side: "LONG" | "SHORT" | null = null;
  try {
    const body = (await req.json()) as { side?: unknown };
    if (body?.side === "LONG" || body?.side === "SHORT") side = body.side;
  } catch {
    side = null;
  }
  if (!side) {
    return NextResponse.json({ ok: false, error: "invalid side" }, { status: 400 });
  }

  const price = await getCurrentPrice();
  await recordDraw(side, price);
  return NextResponse.json({ ok: true, connected: true });
}
