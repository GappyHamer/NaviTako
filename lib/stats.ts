/**
 * Phase 2 통계 — 서버 전용 (클라이언트에서 import 금지).
 *
 * 저장소: Upstash Redis(REST). 환경변수가 없으면 전부 no-op/ null 을 반환하고
 * UI는 재미용 표시로 폴백한다 → 저장소 연결 전에도 사이트는 정상 동작.
 *
 * 적중률은 "예언 후 경과 시점" 기준이다. 예언 시점 가격을 저장해 두고,
 * 예언한 지 1시간·1일·1주·1달·1년이 지난 시점에 방향이 맞았는지를 각각 집계한다.
 * 만기 판정은 "지연 정산(lazy settlement)"으로, 통계를 읽을 때 만기가 지난 예언을
 * Binance 과거 시세(klines)로 정산한다. Vercel Cron은 하루 1회 백업.
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

/** 판정 시점(예언 후 경과) 목록 */
export const WINDOWS = ["1h", "1d", "1w", "1mo", "1y"] as const;
export type Win = (typeof WINDOWS)[number];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WIN_MS: Record<Win, number> = {
  "1h": HOUR,
  "1d": DAY,
  "1w": 7 * DAY,
  "1mo": 30 * DAY,
  "1y": 365 * DAY,
};

const KST_OFFSET = 9 * HOUR;

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

/** 예언 1건 기록: 오늘 분포 카운트 + 모든 판정 시점 대기열에 등록 */
export async function recordDraw(side: Side, price: number | null): Promise<void> {
  if (!redis) return;
  const now = Date.now();
  const day = dayStr(now);
  try {
    await redis.hincrby(`dist:${day}`, side, 1);
    await redis.expire(`dist:${day}`, 60 * 60 * 24 * 45);

    if (price !== null && Number.isFinite(price)) {
      const member = `${randomUUID()}|${now}|${side}|${price}`;
      for (const w of WINDOWS) {
        await redis.zadd(`pend:${w}`, { score: now + WIN_MS[w], member });
      }
    }
  } catch {
    // 저장 실패는 조용히 무시 (사이트 동작에는 영향 없음)
  }
}

/** 만기가 지난 예언들을 정산. ZREM 으로 '선점'해 동시 정산 중복 집계를 막는다. */
export async function settleWindow(win: Win, cap = 60): Promise<void> {
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
    if (!claimed) continue;

    const parts = m.split("|");
    const ts = Number(parts[1]);
    const side = parts[2] as Side;
    const price = Number(parts[3]);
    if (!Number.isFinite(ts) || !Number.isFinite(price)) continue;

    const maturity = ts + WIN_MS[win];
    const priceAt = await getPriceAt(maturity);
    if (priceAt === null) {
      if (now < maturity + 6 * HOUR) {
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
    try {
      await redis.hincrby(`acc:${win}`, "total", 1);
      if (hit) await redis.hincrby(`acc:${win}`, "hits", 1);
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

export type AccuracyKey = Win | "all";
export type StatsPayload = {
  connected: boolean;
  distribution: Distribution | null;
  accuracy: Record<AccuracyKey, Tally>;
};

function emptyAccuracy(): Record<AccuracyKey, Tally> {
  const acc = {} as Record<AccuracyKey, Tally>;
  for (const w of WINDOWS) acc[w] = { hits: 0, total: 0 };
  acc.all = { hits: 0, total: 0 };
  return acc;
}

/** UI용 통계 묶음. 읽기 전에 만기 예언을 지연 정산한다. */
export async function getStats(): Promise<StatsPayload> {
  if (!redis) {
    return {
      connected: false,
      distribution: null,
      accuracy: emptyAccuracy(),
    };
  }

  for (const w of WINDOWS) await settleWindow(w);

  const acc = emptyAccuracy();
  let hitsAll = 0;
  let totalAll = 0;
  for (const w of WINDOWS) {
    const t = await accAll(w);
    acc[w] = t;
    hitsAll += t.hits;
    totalAll += t.total;
  }
  acc.all = { hits: hitsAll, total: totalAll };

  const distribution = await getDistribution();
  return { connected: true, distribution, accuracy: acc };
}

/* -------------------- 키워드 자동 추가분 (대상 코인) -------------------- */

const KW_TARGETS = "kw:targets:extra";

/** 매주 자동 추가된 대상(코인) 단어 목록 */
export async function getExtraTargets(): Promise<string[]> {
  if (!redis) return [];
  try {
    return (await redis.smembers(KW_TARGETS)) as string[];
  } catch {
    return [];
  }
}

/** 대상 단어 추가 (중복은 SET이 자동 무시) */
export async function addExtraTargets(words: string[]): Promise<number> {
  if (!redis || words.length === 0) return 0;
  try {
    return await redis.sadd(KW_TARGETS, words[0], ...words.slice(1));
  } catch {
    return 0;
  }
}
