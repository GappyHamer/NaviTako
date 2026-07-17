import { NextResponse } from "next/server";

/**
 * BTC 최근 가격 히스토리 — 서버 전용 (클라이언트가 Binance 직접 호출 금지).
 * Binance 선물 klines(BTCUSDT, 1h, limit 48)를 fetch(3초 타임아웃)해서
 * [{ t: openTime(ms), c: close }] 배열로 반환한다. 실패 시 [] (차트는 빈 상태 처리).
 * 60초 데이터 캐시 + CDN 캐시로 클릭이 늘어도 외부 호출은 분당 1회 수준.
 */

const TIMEOUT_MS = 3000;
const REVALIDATE_SECONDS = 60;

export const dynamic = "force-dynamic";

type PricePoint = { t: number; c: number };

/** Binance klines 원소: [openTime, open, high, low, close, volume, closeTime, ...] */
type Kline = [number, string, string, string, string, ...unknown[]];

export async function GET() {
  let points: PricePoint[] = [];
  try {
    const res = await fetch(
      "https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=48",
      {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Kline[];
    if (Array.isArray(rows)) {
      points = rows
        .map((row): PricePoint | null => {
          const t = Number(row?.[0]);
          const c = Number(row?.[4]);
          return Number.isFinite(t) && Number.isFinite(c) ? { t, c } : null;
        })
        .filter((p): p is PricePoint => p !== null);
    }
  } catch {
    // 실패해도 차트는 빈 상태로 동작 → 빈 배열 반환
    points = [];
  }

  return NextResponse.json(points, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
