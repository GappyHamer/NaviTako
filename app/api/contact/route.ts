import { NextResponse, type NextRequest } from "next/server";
import { sendContactMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * 문의 접수 (텔레그램 봇으로 운영자에게 전송)
 *  - body: { name?, contact?, message?, website? }
 *  - website: 허니팟(봇 스팸 감지). 값이 있으면 조용히 무시하고 200.
 */
export async function POST(req: NextRequest) {
  let body: { name?: unknown; contact?: unknown; message?: unknown; website?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  // 허니팟: 봇이 채웠으면 아무것도 안 보내고 성공인 척
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (typeof body.message !== "string" || body.message.trim() === "") {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : undefined;
  const contact = typeof body.contact === "string" ? body.contact : undefined;

  const r = await sendContactMessage({ name, contact, message: body.message });

  if (r.ok) return NextResponse.json({ ok: true });

  const status =
    r.reason === "disabled" ? 503 : r.reason === "invalid" ? 400 : 502;
  return NextResponse.json({ ok: false, reason: r.reason }, { status });
}
