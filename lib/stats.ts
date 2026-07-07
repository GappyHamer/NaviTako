/**
 * Phase 2 통계 — 서버 전용 (클라이언트에서 import 금지).
 *
 * 저장소: Upstash Redis(REST). 환경변수가 없으면 전부 no-op/ null 을 반환하고
 * UI는 재미용 표시로 폴백한다 → 저장소 연결 전에도 사이트는 정상 동작.
 *
 * 적중률은 "지연 정산(lazy settlement)" 방식이다. 예언 시점 가격을 저장해 두고,
 * 통계를 읽을 때 만기(4h/24h)가 지난 예언들을 Binance 과거 시세(klines)로 정산한다.
 * Vercel 무료 Cron은 하루 1회만 도므로, 잦은 갱신은 읽기 시점 정산이 담당하고
 * Cron은 트래픽이 없을 때를 위한 백업이다.
 */

import { Redis } from "@upstash/redis";
import { randomUUID } from "node:crypto";

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const statsEnabled = Boolean(url && token);
const redis = statsEnabled ? new Redis({ url, token }) : null;

export type Side = "LONG" | "SHORT";
export type Win = "4h" | "24h";

const WIN_MS: Record<Win, number> = {
  "4h": 4 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET = 9 * 60 * 60 * 1000;

/** ms 타임스탬프를 KST 기준 YYYY-MM-DD 로 */
function dayStr(ms: number): string {
  return new Date(ms + KST_OFFSET).toISOString().slice(0, 10);
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** 현재 BTC 가격 (예언 시점 기록용) */
export async function getCurrentPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://fapi.binance.com/fapi/v1/ticker/price?symbol=BTCUSDT",
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { price?: string };
    const p = Number(j?.price);
    return Number.isFinite(p) ? p : null;
  } catch {
    return null;
  }
}

/** 특정 시각(ms)의 BTC 가격을 1분봉 종가로 (정산용) */
async function getPriceAt(ms: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1m&startTime=${ms}&endTime=${ms + 120000}&limit=1`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const arr = (await res.json()) as unknown[];
    const k = arr?.[0] as unknown[] | undefined;
    const close = k ? Number(k[4]) : NaN;
    return Number.isFinite(close) ? close : null;
  } catch {
    return null;
  }
}

/** 예언 1건 기록: 오늘 분포 카운트 + (가격 있으면) 4h/24h 정산 대기열 등록 */
export async function recordDraw(side: Side, price: number | null): Promise<void> {
  if (!redis) return;
  const now = Date.now();
  const day = dayStr(now);
  try {
    await redis.hincrby(`dist:${day}`, side, 1);
    await redis.expire(`dist:${day}`, 60 * 60 * 24 * 45);

    if (price !== null && Number.isFinite(price)) {
      const member = `${randomUUID()}|${now}|${side}|${price}`;
      await redis.zadd(`pend:4h`, { score: now + WIN_MS["4h"], member });
      await redis.zadd(`pend:24h`, { score: now + WIN_MS["24h"], member });
    }
  } catch {
    // 저장 실패는 조용히 무시 (사이트 동작에는 영향 없음)
  }
}

/** 만기가 지난 예언들을 정산. ZREM 으로 '선점'해 동시 정산 중복 집계를 막는다. */
export async function settleWindow(win: Win, cap = 80): Promise<void> {
  if (!redis) return;
  const now = Date.now();

  let members: string[] = [];
  try {
    members = (await redis.zrange(`pend:${win}`, 0, now, {
      byScore: true,
      offset: 0,
      count: cap,
    })) as string[];
  } catch {
    return;
  }

  for (const m of members) {
    let claimed = 0;
    try {
      claimed = await redis.zrem(`pend:${win}`, m);
    } catch {
      continue;
    }
    if (!claimed) continue; // 다른 정산이 이미 처리함

    const parts = m.split("|");
    const ts = Number(parts[1]);
    const side = parts[2] as Side;
    const price = Number(parts[3]);
    if (!Number.isFinite(ts) || !Number.isFinite(price)) continue;

    const maturity = ts + WIN_MS[win];
    const priceAt = await getPriceAt(maturity);
    if (priceAt === null) {
      // 아직 시세를 못 구함 → 다음에 재시도 (너무 오래된 건 포기)
      if (now < maturity + 6 * 60 * 60 * 1000) {
        try {
          await redis.zadd(`pend:${win}`, { score: maturity, member: m });
        } catch {
          // 무시
        }
      }
      continue;
    }

    const hit =
      (side === "LONG" && priceAt > price) ||
      (side === "SHORT" && priceAt < price);
    const day = dayStr(maturity);
    try {
      await redis.hincrby(`acc:${win}`, "total", 1);
      await redis.hincrby(`acc:${win}:${day}`, "total", 1);
      if (hit) {
        await redis.hincrby(`acc:${win}`, "hits", 1);
        await redis.hincrby(`acc:${win}:${day}`, "hits", 1);
      }
      await redis.expire(`acc:${win}:${day}`, 60 * 60 * 24 * 400);
    } catch {
      // 무시
    }
  }
}

export type Tally = { hits: number; total: number };
export type Distribution = {
  long: number;
  short: number;
  total: number;
  day: string;
};

/** 오늘(KST)의 롱/숏 예언 분포 */
export async function getDistribution(): Promise<Distribution | null> {
  if (!redis) return null;
  const day = dayStr(Date.now());
  try {
    const h = await redis.hgetall<Record<string, unknown>>(`dist:${day}`);
    const long = num(h?.LONG);
    const short = num(h?.SHORT);
    return { long, short, total: long + short, day };
  } catch {
    return null;
  }
}

async function accAll(win: Win): Promise<Tally> {
  if (!redis) return { hits: 0, total: 0 };
  try {
    const h = await redis.hgetall<Record<string, unknown>>(`acc:${win}`);
    return { hits: num(h?.hits), total: num(h?.total) };
  } catch {
    return { hits: 0, total: 0 };
  }
}

async function accRange(win: Win, days: number): Promise<Tally> {
  if (!redis) return { hits: 0, total: 0 };
  const now = Date.now();
  const keys: string[] = [];
  for (let i = 0; i < days; i++) keys.push(`acc:${win}:${dayStr(now - i * DAY_MS)}`);
  try {
    const pipe = redis.pipeline();
    keys.forEach((k) => pipe.hgetall(k));
    const res = (await pipe.exec()) as Array<Record<string, unknown> | null>;
    let hits = 0;
    let total = 0;
    for (const h of res) {
      if (h) {
        hits += num(h.hits);
        total += num(h.total);
      }
    }
    return { hits, total };
  } catch {
    return { hits: 0, total: 0 };
  }
}

export type StatsPayload = {
  connected: boolean;
  distribution: Distribution | null;
  accuracy: Record<Win, { all: Tally; d30: Tally; d7: Tally }>;
};

/** UI용 통계 묶음. 읽기 전에 만기 예언을 지연 정산한다. */
export async function getStats(): Promise<StatsPayload> {
  if (!redis) {
    const empty: Tally = { hits: 0, total: 0 };
    return {
      connected: false,
      distribution: null,
      accuracy: {
        "4h": { all: empty, d30: empty, d7: empty },
        "24h": { all: empty, d30: empty, d7: empty },
      },
    };
  }

  await settleWindow("4h");
  await settleWindow("24h");

  const [dist, a4a, a4_30, a4_7, a24a, a24_30, a24_7] = await Promise.all([
    getDistribution(),
    accAll("4h"),
    accRange("4h", 30),
    accRange("4h", 7),
    accAll("24h"),
    accRange("24h", 30),
    accRange("24h", 7),
  ]);

  return {
    connected: true,
    distribution: dist,
    accuracy: {
      "4h": { all: a4a, d30: a4_30, d7: a4_7 },
      "24h": { all: a24a, d30: a24_30, d7: a24_7 },
    },
  };
}
