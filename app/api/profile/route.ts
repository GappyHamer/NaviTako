import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { setNick, setPicOn } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/**
 * 프로필 변경 (로그인 필수)
 *  - body.picOn(boolean) 있으면 프로필 사진 표시 on/off
 *  - body.nick(string)  있으면 닉네임 변경 (최초 자유, 이후 90일 1회 → cooldown 시 429)
 */
export async function POST(req: NextRequest) {
  const s = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) {
    return NextResponse.json({ ok: false, reason: "login" }, { status: 401 });
  }
  const userId = "g:" + s.sub;

  let body: { nick?: unknown; picOn?: unknown } = {};
  try {
    body = (await req.json()) as { nick?: unknown; picOn?: unknown };
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  if (typeof body.picOn === "boolean") {
    const r = await setPicOn(userId, body.picOn);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }

  if (typeof body.nick === "string") {
    const r = await setNick(userId, body.nick);
    const status = r.ok ? 200 : r.reason === "cooldown" ? 429 : 400;
    return NextResponse.json(r, { status });
  }

  return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
}
