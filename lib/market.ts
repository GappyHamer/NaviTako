/**
 * 외부 시장 지표 5종 수집 — 서버 전용 (클라이언트에서 import 금지).
 * 각 호출은 개별 try/catch + 3초 타임아웃, 성공한 지표만 사용한다.
 * fetch 데이터 캐시(next.revalidate=60)로 60초 캐싱 — 클릭이 늘어도
 * 외부 API 호출은 분당 1회 수준으로 유지된다.
 */

import type { MarketIndicators } from "@/lib/oracle";

const TIMEOUT_MS = 3000;
const REVALIDATE_SECONDS = 60;

export type MarketSourceKey =
  | "fng"
  | "funding"
  | "topRatio"
  | "globalRatio"
  | "ticker";

export type MarketData = {
  indicators: MarketIndicators;
  /** 24h 마지막 체결가 (표시용 — /market 페이지에서만 사용) */
  lastPrice: number | null;
  /** 실패한 소스 키 목록 */
  failed: MarketSourceKey[];
  /** 5개 소스 전부 실패 → 운빨 모드 */
  allFailed: boolean;
  updatedAt: string;
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

/** 문자열/숫자를 유한한 number로 정규화. 실패 시 null. */
function toNumber(value: unknown): number | null {
  const n =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
        ? value
        : NaN;
  return Number.isFinite(n) ? n : null;
}

type Raw = Record<string, unknown>;

async function fetchFng(): Promise<number> {
  const json = (await fetchJson(
    "https://api.alternative.me/fng/?limit=1"
  )) as Raw;
  const value = toNumber((json.data as Raw[] | undefined)?.[0]?.value);
  if (value === null || value < 0 || value > 100) {
    throw new Error("invalid fng value");
  }
  return value;
}

async function fetchFunding(): Promise<number> {
  const json = (await fetchJson(
    "https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT"
  )) as Raw;
  const rate = toNumber(json.lastFundingRate);
  if (rate === null) throw new Error("invalid funding rate");
  return rate;
}

async function fetchTopRatio(): Promise<number> {
  const json = (await fetchJson(
    "https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=1h&limit=1"
  )) as Raw[];
  const ratio = toNumber(json?.[0]?.longShortRatio);
  if (ratio === null || ratio <= 0) throw new Error("invalid top ratio");
  return ratio;
}

async function fetchGlobalRatio(): Promise<number> {
  const json = (await fetchJson(
    "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=1"
  )) as Raw[];
  const ratio = toNumber(json?.[0]?.longShortRatio);
  if (ratio === null || ratio <= 0) throw new Error("invalid global ratio");
  return ratio;
}

async function fetchTicker(): Promise<{
  momentumPct: number;
  lastPrice: number | null;
}> {
  const json = (await fetchJson(
    "https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT"
  )) as Raw;
  const momentumPct = toNumber(json.priceChangePercent);
  if (momentumPct === null) throw new Error("invalid ticker");
  return { momentumPct, lastPrice: toNumber(json.lastPrice) };
}

export async function getMarketData(): Promise<MarketData> {
  const [fng, funding, top, global_, ticker] = await Promise.allSettled([
    fetchFng(),
    fetchFunding(),
    fetchTopRatio(),
    fetchGlobalRatio(),
    fetchTicker(),
  ]);

  const failed: MarketSourceKey[] = [];
  if (fng.status === "rejected") failed.push("fng");
  if (funding.status === "rejected") failed.push("funding");
  if (top.status === "rejected") failed.push("topRatio");
  if (global_.status === "rejected") failed.push("globalRatio");
  if (ticker.status === "rejected") failed.push("ticker");

  const indicators: MarketIndicators = {
    fng: fng.status === "fulfilled" ? fng.value : null,
    fundingRate: funding.status === "fulfilled" ? funding.value : null,
    topRatio: top.status === "fulfilled" ? top.value : null,
    globalRatio: global_.status === "fulfilled" ? global_.value : null,
    momentumPct: ticker.status === "fulfilled" ? ticker.value.momentumPct : null,
  };

  return {
    indicators,
    lastPrice: ticker.status === "fulfilled" ? ticker.value.lastPrice : null,
    failed,
    allFailed: failed.length === 5,
    updatedAt: new Date().toISOString(),
  };
}
