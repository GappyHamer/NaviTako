/**
 * Phase 3 — 사용자 데일리 예측 + 리더보드 (서버 전용).
 *
 * 사용자가 하루 1번 BTC 롱/숏을 직접 예측하면 24시간 뒤 실제 방향으로 채점한다
 * (Tako 적중률과 같은 klines 정산). 개인 누적 적중·연속 스트릭을 쌓아 리더보드로
 * 보여준다. 저장소는 Upstash Redis(통계와 같은 DB)를 쓰고, 미연결이면 폴백.
 *
 * 정체성은 익명 userId(클라이언트 UUID). 닉네임은 표시용. 하루 1회 제한이
 * 기본 어뷰징 방지이고, 구글 로그인은 이 userId 에 계정을 붙이는 식으로 확장한다.
 */

import { Redis } from "@upstash/redis";

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const leaderboardEnabled = Boolean(url && token);
const redis = leaderboardEnabled ? new Redis({ url, token }) : null;

export type Side = "LONG" | "SHORT";
export type LbSort = "streak" | "acc";

const HOUR = 60 * 60 * 1000;
const JUDGE_MS = 24 * HOUR; // 24시간 뒤 채점
const KST_OFFSET = 9 * HOUR;
const MIN_QUALIFY = 5; // 적중률 순위 등록 최소 예측 수
const TOP_N = 20;

const PENDING = "upred:pending";
const LB_STREAK = "lb:streak";
const LB_ACC = "lb:acc";
const userKey = (id: string) => `u:${id}`;

function todayKST(): string {
  return new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeNick(nick: string): string {
  return nick.replace(/\s+/g, " ").trim().slice(0, 16);
}

async function getCurrentPrice(): Promise<number | null> {
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

export type UserRecord = {
  nick: string;
  hits: number;
  total: number;
  streak: number;
  best: number;
};

export type PredictStatus = {
  connected: boolean;
  record: UserRecord | null;
  predictedToday: boolean;
  todaySide: Side | null;
};

/** 사용자 현재 상태(오늘 예측했는지 + 누적 기록) */
export async function getUserStatus(userId: string): Promise<PredictStatus> {
  if (!redis || !userId) {
    return { connected: leaderboardEnabled, record: null, predictedToday: false, todaySide: null };
  }
  try {
    const h = await redis.hgetall<Record<string, unknown>>(userKey(userId));
    if (!h) {
      return { connected: true, record: null, predictedToday: false, todaySide: null };
    }
    const record: UserRecord = {
      nick: typeof h.nick === "string" ? h.nick : "익명",
      hits: num(h.hits),
      total: num(h.total),
      streak: num(h.streak),
      best: num(h.best),
    };
    const predictedToday = h.lastDay === todayKST();
    const todaySide =
      predictedToday && (h.lastSide === "LONG" || h.lastSide === "SHORT")
        ? (h.lastSide as Side)
        : null;
    return { connected: true, record, predictedToday, todaySide };
  } catch {
    return { connected: true, record: null, predictedToday: false, todaySide: null };
  }
}

export type PredictResult = {
  ok: boolean;
  reason?: "disabled" | "invalid" | "already_today" | "no_price" | "error";
};

/** 오늘의 예측 1건 기록 (하루 1회 제한) */
export async function recordUserPrediction(
  userId: string,
  nick: string,
  side: Side
): Promise<PredictResult> {
  if (!redis) return { ok: false, reason: "disabled" };
  if (!userId || (side !== "LONG" && side !== "SHORT")) {
    return { ok: false, reason: "invalid" };
  }
  const cleanNick = sanitizeNick(nick) || "익명";
  const today = todayKST();
  const key = userKey(userId);

  try {
    const lastDay = await redis.hget<string>(key, "lastDay");
    if (lastDay === today) return { ok: false, reason: "already_today" };

    const price = await getCurrentPrice();
    if (price === null) return { ok: false, reason: "no_price" };

    const ts = Date.now();
    await redis.hset(key, { nick: cleanNick, lastDay: today, lastSide: side });
    await redis.zadd(PENDING, {
      score: ts + JUDGE_MS,
      member: `${userId}|${ts}|${side}|${price}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** 만기(24h) 예측 정산 — ZREM 선점으로 중복 방지, 스트릭·리더보드 갱신 */
export async function settleUserPredictions(cap = 100): Promise<void> {
  if (!redis) return;
  const now = Date.now();

  let members: string[] = [];
  try {
    members = (await redis.zrange(PENDING, 0, now, {
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
      claimed = await redis.zrem(PENDING, m);
    } catch {
      continue;
    }
    if (!claimed) continue;

    const parts = m.split("|");
    const userId = parts[0];
    const ts = Number(parts[1]);
    const side = parts[2] as Side;
    const price = Number(parts[3]);
    if (!userId || !Number.isFinite(ts) || !Number.isFinite(price)) continue;

    const priceAt = await getPriceAt(ts + JUDGE_MS);
    if (priceAt === null) {
      if (now < ts + JUDGE_MS + 6 * HOUR) {
        try {
          await redis.zadd(PENDING, { score: ts + JUDGE_MS, member: m });
        } catch {
          // 무시
        }
      }
      continue;
    }

    const hit =
      (side === "LONG" && priceAt > price) ||
      (side === "SHORT" && priceAt < price);
    const key = userKey(userId);
    try {
      await redis.hincrby(key, "total", 1);
      let streak: number;
      if (hit) {
        await redis.hincrby(key, "hits", 1);
        streak = await redis.hincrby(key, "streak", 1);
        const best = num(await redis.hget(key, "best"));
        if (streak > best) await redis.hset(key, { best: streak });
      } else {
        await redis.hset(key, { streak: 0 });
        streak = 0;
      }

      const hits = num(await redis.hget(key, "hits"));
      const total = num(await redis.hget(key, "total"));
      await redis.zadd(LB_STREAK, { score: streak, member: userId });
      if (total >= MIN_QUALIFY) {
        await redis.zadd(LB_ACC, {
          score: Math.round((hits / total) * 10000),
          member: userId,
        });
      }
    } catch {
      // 무시
    }
  }
}

export type LeaderboardEntry = {
  rank: number;
  nick: string;
  hits: number;
  total: number;
  streak: number;
  best: number;
  isMe: boolean;
};

export type LeaderboardPayload = {
  connected: boolean;
  sort: LbSort;
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

async function recordOf(userId: string): Promise<UserRecord> {
  const h = await redis!.hgetall<Record<string, unknown>>(userKey(userId));
  return {
    nick: h && typeof h.nick === "string" ? h.nick : "익명",
    hits: num(h?.hits),
    total: num(h?.total),
    streak: num(h?.streak),
    best: num(h?.best),
  };
}

/** 리더보드 상위 N + 내 순위. 읽기 전에 지연 정산. */
export async function getLeaderboard(
  sort: LbSort,
  meUserId?: string
): Promise<LeaderboardPayload> {
  if (!redis) {
    return { connected: false, sort, top: [], me: null };
  }

  await settleUserPredictions();

  const key = sort === "acc" ? LB_ACC : LB_STREAK;
  let ids: string[] = [];
  try {
    ids = (await redis.zrange(key, 0, TOP_N - 1, { rev: true })) as string[];
  } catch {
    ids = [];
  }

  const top: LeaderboardEntry[] = [];
  for (let i = 0; i < ids.length; i++) {
    const rec = await recordOf(ids[i]);
    top.push({
      rank: i + 1,
      nick: rec.nick,
      hits: rec.hits,
      total: rec.total,
      streak: rec.streak,
      best: rec.best,
      isMe: meUserId === ids[i],
    });
  }

  let me: LeaderboardEntry | null = null;
  if (meUserId) {
    try {
      const rank = await redis.zrevrank(key, meUserId);
      const rec = await recordOf(meUserId);
      if (rec.total > 0 || rank !== null) {
        me = {
          rank: rank === null ? 0 : rank + 1,
          nick: rec.nick,
          hits: rec.hits,
          total: rec.total,
          streak: rec.streak,
          best: rec.best,
          isMe: true,
        };
      }
    } catch {
      me = null;
    }
  }

  return { connected: true, sort, top, me };
}
