import { NextResponse } from "next/server";
import { addExtraTargets, statsEnabled } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 주간 대상 코인 갱신. Vercel Cron이 주 1회 호출(vercel.json).
 * CoinGecko 트렌딩에서 코인 이름을 받아 자동 추가 대상(SET)에 저장한다.
 * 외부 fetch·파싱은 모두 감싸 어떤 경우에도 500이 나지 않게 한다.
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

  let names: string[] = [];
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/search/trending",
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const j = (await res.json()) as {
        coins?: { item?: { name?: unknown } }[];
      };
      const coins = Array.isArray(j?.coins) ? j.coins : [];
      names = coins
        .map((c) => c?.item?.name)
        .filter((n): n is string => typeof n === "string")
        .map((n) => n.trim())
        .filter((n) => n.length > 0 && n.length <= 12)
        .slice(0, 15);
    }
  } catch {
    return NextResponse.json({ ok: true, added: 0 });
  }

  if (names.length === 0) {
    return NextResponse.json({ ok: true, added: 0 });
  }

  await addExtraTargets(names);
  return NextResponse.json({ ok: true, added: names.length });
}
