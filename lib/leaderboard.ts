/**
 * Phase 3+ — 로그인 플레이어의 다중 시간대 롱/숏 예측 + 리더보드 (서버 전용).
 *
 * 시간대 5종: 4h / 1d / 1w / 1mo / 1y. 모든 경계는 KST(UTC+9) 09:00 기준.
 *  - 4h : 09·13·17·21·01·05시(KST)로 4시간 격자
 *  - 1d : 당일 09:00 ~ 익일 09:00
 *  - 1w : 월요일 09:00 ~ 다음 월요일 09:00 (달력 주)
 *  - 1mo: 1일 09:00 ~ 다음달 1일 09:00 (달력 월)
 *  - 1y : 1/1 09:00 ~ 다음해 1/1 09:00 (달력 연)
 *
 * 채점: 예측 시점 가격 → 해당 기간 종료 시점 가격의 방향. 한 기간당 1회 예측(잠금).
 * 시간대별 적중률·연속 스트릭 누적 + 전체 합산(통합) 리더보드. 로그인 필수.
 */

import { Redis } from "@upstash/redis";

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const leaderboardEnabled = Boolean(url && token);
const redis = leaderboardEnabled ? new Redis({ url, token }) : null;

export type Side = "LONG" | "SHORT";
export type Tf = "4h" | "1d" | "1w" | "1mo" | "1y";
export const TIMEFRAMES: Tf[] = ["4h", "1d", "1w", "1mo", "1y"];
export type LbKey = Tf | "all";
export type LbSort = "acc" | "streak";

const H = 60 * 60 * 1000;
const D = 24 * H;
const KST = 9 * H;
const MIN_QUALIFY = 3; // 적중률 순위 등록 최소 예측 수
const TOP_N = 20;
const NICK_MAX = 16; // 닉네임 최대 길이
const NICK_COOLDOWN = 90 * D; // 닉네임 변경 쿨다운(90일)

/* ---------------- 기간 경계 (KST 09:00 기준) ---------------- */

export type Period = { key: string; start: number; end: number };

function iso13(kstMs: number): string {
  return new Date(kstMs).toISOString().slice(0, 13); // YYYY-MM-DDTHH
}
function iso10(kstMs: number): string {
  return new Date(kstMs).toISOString().slice(0, 10); // YYYY-MM-DD
}

/** 현재 열린 기간. now(UTC ms) 기준. KST 필드는 shifted ms를 UTC로 읽어 얻는다. */
export function currentPeriod(tf: Tf, now: number): Period {
  const k = now + KST; // KST 기준 ms (UTC로 읽으면 KST 달력값)
  const d = new Date(k);
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth();
  const DA = d.getUTCDate();
  const HH = d.getUTCHours();

  if (tf === "4h") {
    // 경계가 09:00을 지나도록 1시간 오프셋 (KST hour ≡ 1 mod 4 → 1,5,9,13,17,21)
    const startK = Math.floor((k - 1 * H) / (4 * H)) * (4 * H) + 1 * H;
    return { key: `4h:${iso13(startK)}`, start: startK - KST, end: startK - KST + 4 * H };
  }
  if (tf === "1d") {
    let startK = Date.UTC(Y, M, DA, 9);
    if (HH < 9) startK -= D;
    return { key: `1d:${iso10(startK)}`, start: startK - KST, end: startK - KST + D };
  }
  if (tf === "1w") {
    let startK = Date.UTC(Y, M, DA, 9);
    if (HH < 9) startK -= D;
    const dow = new Date(startK).getUTCDay(); // 0=Sun..6=Sat
    const back = (dow + 6) % 7; // 월요일까지 되돌리기
    startK -= back * D;
    return { key: `1w:${iso10(startK)}`, start: startK - KST, end: startK - KST + 7 * D };
  }
  if (tf === "1mo") {
    let sY = Y;
    let sM = M;
    let startK = Date.UTC(Y, M, 1, 9);
    if (k < startK) {
      sM = M - 1;
      if (sM < 0) {
        sM = 11;
        sY = Y - 1;
      }
      startK = Date.UTC(sY, sM, 1, 9);
    }
    const endK = Date.UTC(sM === 11 ? sY + 1 : sY, sM === 11 ? 0 : sM + 1, 1, 9);
    return {
      key: `1mo:${sY}-${String(sM + 1).padStart(2, "0")}`,
      start: startK - KST,
      end: endK - KST,
    };
  }
  // 1y
  let sY = Y;
  let startK = Date.UTC(Y, 0, 1, 9);
  if (k < startK) {
    sY = Y - 1;
    startK = Date.UTC(sY, 0, 1, 9);
  }
  const endK = Date.UTC(sY + 1, 0, 1, 9);
  return { key: `1y:${sY}`, start: startK - KST, end: endK - KST };
}

/* ---------------- 가격 (Binance) ---------------- */

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
    const kk = arr?.[0] as unknown[] | undefined;
    const close = kk ? Number(kk[4]) : NaN;
    return Number.isFinite(close) ? close : null;
  } catch {
    return null;
  }
}

/* ---------------- Redis 키 ---------------- */

const kProfile = (u: string) => `u:${u}`; // hash {nick, pic}
const kStats = (u: string) => `u:${u}:s`; // hash {tf.hits, tf.total, tf.streak, tf.best}
const kCur = (u: string) => `u:${u}:cur`; // hash {tf -> periodKey|side|price}
const kQueue = (tf: Tf) => `jq:${tf}`; // zset score=end member=uid|periodKey|side|price
const kLb = (key: LbKey, sort: LbSort) => `lb:${key}:${sort}`; // zset uid->metric

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ---------------- 예측 기록 ---------------- */

export type PredictResult = {
  ok: boolean;
  reason?: "disabled" | "invalid" | "already_period" | "no_price" | "error";
};

export async function recordPrediction(
  userId: string,
  profile: { nick: string; pic: string },
  tf: Tf,
  side: Side
): Promise<PredictResult> {
  if (!redis) return { ok: false, reason: "disabled" };
  if (!userId || !TIMEFRAMES.includes(tf) || (side !== "LONG" && side !== "SHORT")) {
    return { ok: false, reason: "invalid" };
  }
  const now = Date.now();
  const period = currentPeriod(tf, now);

  try {
    const existing = await redis.hget<string>(kCur(userId), tf);
    if (existing && existing.split("|")[0] === period.key) {
      return { ok: false, reason: "already_period" };
    }
    const price = await getCurrentPrice();
    if (price === null) return { ok: false, reason: "no_price" };

    // 닉네임은 최초 1회만 구글 이름으로 시드(이후 사용자가 커스텀 설정 가능),
    // 프로필 사진 URL은 항상 최신 구글 사진으로 갱신(표시 여부는 picOn 이 제어)
    await redis.hsetnx(
      kProfile(userId),
      "nick",
      (profile.nick || "플레이어").slice(0, NICK_MAX)
    );
    await redis.hset(kProfile(userId), { pic: (profile.pic || "").slice(0, 300) });
    await redis.hset(kCur(userId), { [tf]: `${period.key}|${side}|${price}` });
    await redis.zadd(kQueue(tf), {
      score: period.end,
      member: `${userId}|${period.key}|${side}|${price}|${period.end}`,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/* ---------------- 정산 ---------------- */

async function recomputeCombined(userId: string): Promise<{
  hits: number;
  total: number;
  streak: number;
}> {
  const h = await redis!.hgetall<Record<string, unknown>>(kStats(userId));
  let hits = 0;
  let total = 0;
  let streak = 0;
  for (const tf of TIMEFRAMES) {
    hits += num(h?.[`${tf}.hits`]);
    total += num(h?.[`${tf}.total`]);
    streak += num(h?.[`${tf}.streak`]);
  }
  return { hits, total, streak };
}

async function updateLb(userId: string, key: LbKey, hits: number, total: number, streak: number) {
  await redis!.zadd(kLb(key, "streak"), { score: streak, member: userId });
  if (total >= MIN_QUALIFY) {
    await redis!.zadd(kLb(key, "acc"), {
      score: Math.round((hits / total) * 10000),
      member: userId,
    });
  }
}

export async function settleWindow(tf: Tf, cap = 100): Promise<void> {
  if (!redis) return;
  const now = Date.now();
  let members: string[] = [];
  try {
    members = (await redis.zrange(kQueue(tf), 0, now, {
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
      claimed = await redis.zrem(kQueue(tf), m);
    } catch {
      continue;
    }
    if (!claimed) continue;

    const parts = m.split("|");
    const userId = parts[0];
    const side = parts[2] as Side;
    const price = Number(parts[3]);
    const end = Number(parts[4]);
    if (!userId || !Number.isFinite(price) || !Number.isFinite(end)) continue;

    const endPrice = await getPriceAt(end);
    if (endPrice === null) {
      // 종료 시점 시세 못 구함 → 재시도 (너무 오래된 건 포기)
      if (now < end + 6 * H) {
        try {
          await redis.zadd(kQueue(tf), { score: end, member: m });
        } catch {
          // 무시
        }
      }
      continue;
    }

    const hit =
      (side === "LONG" && endPrice > price) ||
      (side === "SHORT" && endPrice < price);

    try {
      await redis.hincrby(kStats(userId), `${tf}.total`, 1);
      let streak: number;
      if (hit) {
        await redis.hincrby(kStats(userId), `${tf}.hits`, 1);
        streak = await redis.hincrby(kStats(userId), `${tf}.streak`, 1);
        const best = num(await redis.hget(kStats(userId), `${tf}.best`));
        if (streak > best) await redis.hset(kStats(userId), { [`${tf}.best`]: streak });
      } else {
        await redis.hset(kStats(userId), { [`${tf}.streak`]: 0 });
        streak = 0;
      }
      const tfHits = num(await redis.hget(kStats(userId), `${tf}.hits`));
      const tfTotal = num(await redis.hget(kStats(userId), `${tf}.total`));
      await updateLb(userId, tf, tfHits, tfTotal, streak);

      const c = await recomputeCombined(userId);
      await updateLb(userId, "all", c.hits, c.total, c.streak);
    } catch {
      // 무시
    }
  }
}

export async function settleAll(cap = 100): Promise<void> {
  for (const tf of TIMEFRAMES) await settleWindow(tf, cap);
}

/* ---------------- 플레이어 상태 ---------------- */

export type TfState = {
  hits: number;
  total: number;
  streak: number;
  best: number;
  pickedSide: Side | null; // 현재 열린 기간에 이미 찍은 방향
  periodEnd: number; // 현재 기간 종료(ms)
};

export type PlayerState = {
  connected: boolean;
  nick: string; // 커스텀 닉네임(없으면 "")
  picOn: boolean; // 프로필 사진 표시 여부
  nickChangeableAt: number; // 다음 변경 가능 시각(ms). 0이면 지금 변경 가능
  perTf: Record<Tf, TfState>;
  combined: { hits: number; total: number; streak: number };
};

export async function getPlayerState(userId: string): Promise<PlayerState> {
  const empty = (): PlayerState => {
    const perTf = {} as Record<Tf, TfState>;
    const now = Date.now();
    for (const tf of TIMEFRAMES) {
      perTf[tf] = { hits: 0, total: 0, streak: 0, best: 0, pickedSide: null, periodEnd: currentPeriod(tf, now).end };
    }
    return {
      connected: leaderboardEnabled,
      nick: "",
      picOn: true,
      nickChangeableAt: 0,
      perTf,
      combined: { hits: 0, total: 0, streak: 0 },
    };
  };
  if (!redis || !userId) return empty();

  try {
    await settleAll(40);
    const now = Date.now();
    const [stats, cur, profile] = await Promise.all([
      redis.hgetall<Record<string, unknown>>(kStats(userId)),
      redis.hgetall<Record<string, unknown>>(kCur(userId)),
      redis.hgetall<Record<string, unknown>>(kProfile(userId)),
    ]);
    const nick =
      profile && typeof profile.nick === "string" ? profile.nick : "";
    const picOn = !(profile && profile.picOn === "0");
    const nickAt = num(profile?.nickAt);
    const nickChangeableAt = nickAt > 0 ? nickAt + NICK_COOLDOWN : 0;
    const perTf = {} as Record<Tf, TfState>;
    let cH = 0;
    let cT = 0;
    let cS = 0;
    for (const tf of TIMEFRAMES) {
      const period = currentPeriod(tf, now);
      const raw = typeof cur?.[tf] === "string" ? (cur[tf] as string) : "";
      const p = raw.split("|");
      const pickedSide =
        p[0] === period.key && (p[1] === "LONG" || p[1] === "SHORT")
          ? (p[1] as Side)
          : null;
      const hits = num(stats?.[`${tf}.hits`]);
      const total = num(stats?.[`${tf}.total`]);
      const streak = num(stats?.[`${tf}.streak`]);
      const best = num(stats?.[`${tf}.best`]);
      perTf[tf] = { hits, total, streak, best, pickedSide, periodEnd: period.end };
      cH += hits;
      cT += total;
      cS += streak;
    }
    return {
      connected: true,
      nick,
      picOn,
      nickChangeableAt,
      perTf,
      combined: { hits: cH, total: cT, streak: cS },
    };
  } catch {
    return empty();
  }
}

/* ---------------- 프로필 (닉네임·사진 표시) ---------------- */

export type ProfileResult = {
  ok: boolean;
  reason?: "disabled" | "invalid" | "cooldown" | "error";
  nick?: string;
  picOn?: boolean;
  nickChangeableAt?: number;
};

/** 닉네임 변경. 최초 설정은 자유, 이후 90일에 1회. */
export async function setNick(userId: string, raw: string): Promise<ProfileResult> {
  if (!redis) return { ok: false, reason: "disabled" };
  const nick = (raw ?? "").trim().replace(/\s+/g, " ").slice(0, NICK_MAX);
  if (!userId || nick.length < 1) return { ok: false, reason: "invalid" };
  try {
    const now = Date.now();
    const lastAt = num(await redis.hget(kProfile(userId), "nickAt"));
    if (lastAt > 0 && now < lastAt + NICK_COOLDOWN) {
      return {
        ok: false,
        reason: "cooldown",
        nickChangeableAt: lastAt + NICK_COOLDOWN,
      };
    }
    await redis.hset(kProfile(userId), { nick, nickAt: now });
    return { ok: true, nick, nickChangeableAt: now + NICK_COOLDOWN };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** 프로필 사진 표시 on/off */
export async function setPicOn(userId: string, on: boolean): Promise<ProfileResult> {
  if (!redis) return { ok: false, reason: "disabled" };
  if (!userId) return { ok: false, reason: "invalid" };
  try {
    await redis.hset(kProfile(userId), { picOn: on ? "1" : "0" });
    return { ok: true, picOn: on };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/* ---------------- 리더보드 ---------------- */

export type LbEntry = {
  rank: number;
  nick: string;
  pic: string;
  hits: number;
  total: number;
  streak: number;
  isMe: boolean;
};

export type LeaderboardPayload = {
  connected: boolean;
  key: LbKey;
  sort: LbSort;
  top: LbEntry[];
  me: LbEntry | null;
};

async function statsFor(userId: string, key: LbKey): Promise<{ hits: number; total: number; streak: number; nick: string; pic: string }> {
  const [profile, stats] = await Promise.all([
    redis!.hgetall<Record<string, unknown>>(kProfile(userId)),
    redis!.hgetall<Record<string, unknown>>(kStats(userId)),
  ]);
  const nick = profile && typeof profile.nick === "string" ? profile.nick : "플레이어";
  const picOn = !(profile && profile.picOn === "0");
  const pic =
    picOn && profile && typeof profile.pic === "string" ? profile.pic : "";
  if (key === "all") {
    let hits = 0;
    let total = 0;
    let streak = 0;
    for (const tf of TIMEFRAMES) {
      hits += num(stats?.[`${tf}.hits`]);
      total += num(stats?.[`${tf}.total`]);
      streak += num(stats?.[`${tf}.streak`]);
    }
    return { hits, total, streak, nick, pic };
  }
  return {
    hits: num(stats?.[`${key}.hits`]),
    total: num(stats?.[`${key}.total`]),
    streak: num(stats?.[`${key}.streak`]),
    nick,
    pic,
  };
}

export async function getLeaderboard(
  key: LbKey,
  sort: LbSort,
  meUserId?: string
): Promise<LeaderboardPayload> {
  if (!redis) return { connected: false, key, sort, top: [], me: null };
  await settleAll(40);

  let ids: string[] = [];
  try {
    ids = (await redis.zrange(kLb(key, sort), 0, TOP_N - 1, { rev: true })) as string[];
  } catch {
    ids = [];
  }

  const top: LbEntry[] = [];
  for (let i = 0; i < ids.length; i++) {
    const s = await statsFor(ids[i], key);
    top.push({
      rank: i + 1,
      nick: s.nick,
      pic: s.pic,
      hits: s.hits,
      total: s.total,
      streak: s.streak,
      isMe: meUserId === ids[i],
    });
  }

  let me: LbEntry | null = null;
  if (meUserId) {
    try {
      const rank = await redis.zrevrank(kLb(key, sort), meUserId);
      const s = await statsFor(meUserId, key);
      if (s.total > 0 || rank !== null) {
        me = {
          rank: rank === null ? 0 : rank + 1,
          nick: s.nick,
          pic: s.pic,
          hits: s.hits,
          total: s.total,
          streak: s.streak,
          isMe: true,
        };
      }
    } catch {
      me = null;
    }
  }

  return { connected: true, key, sort, top, me };
}
