/**
 * 신탁 알고리즘 (스펙 3.2 고정 — 수식 임의 변경 금지).
 * 순수 함수로만 구성되어 서버·클라이언트 양쪽에서 사용 가능하다.
 * 실제 계산은 클라이언트에서 수행한다(/api/market 응답을 받아서).
 */

import {
  FUNDING_SCALE,
  MOMENTUM_SCALE,
  ORACLE_WEIGHTS,
  P_BASE,
  P_MAX,
  P_MIN,
  P_SLOPE,
} from "@/config/oracle.config";

export type OracleSide = "LONG" | "SHORT";

export type SignalKey = keyof typeof ORACLE_WEIGHTS;

/** /api/market 이 내려주는 지표 묶음. 실패한 지표는 null. */
export type MarketIndicators = {
  /** 공포탐욕지수 0~100 */
  fng: number | null;
  /** 펀딩비 (소수, 예: 0.0001 = 0.01%) */
  fundingRate: number | null;
  /** 고수(탑 트레이더) 롱숏 포지션 비율 */
  topRatio: number | null;
  /** 전체 계정 롱숏 비율 */
  globalRatio: number | null;
  /** 24h 가격 변동률 (%) */
  momentumPct: number | null;
};

export const EMPTY_INDICATORS: MarketIndicators = {
  fng: null,
  fundingRate: null,
  topRatio: null,
  globalRatio: null,
  momentumPct: null,
};

/** [-1, 1] 기본 클램프 */
export function clamp(value: number, min = -1, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * 각 지표를 롱 편향 +1 ~ 숏 편향 -1로 정규화.
 * 계산 불가능한 지표(null, 비정상 값)는 null 유지.
 */
export function computeSignals(
  m: MarketIndicators
): Record<SignalKey, number | null> {
  return {
    // s1 공포탐욕(역발상): 공포일수록 롱
    s1: finite(m.fng) ? clamp((50 - m.fng) / 50) : null,
    // s2 펀딩비(역발상): 펀딩 과열(+0.05%)이면 숏
    s2: finite(m.fundingRate) ? -clamp(m.fundingRate / FUNDING_SCALE) : null,
    // s3 고수 포지션(추종): 고수가 롱이면 롱
    s3:
      finite(m.topRatio) && m.topRatio > 0
        ? clamp(Math.log(m.topRatio) / Math.LN2)
        : null,
    // s4 전체 계정(역발상): 개미 쏠림 반대
    s4:
      finite(m.globalRatio) && m.globalRatio > 0
        ? -clamp(Math.log(m.globalRatio) / Math.LN2)
        : null,
    // s5 24h 모멘텀(추종): ±5%에서 포화
    s5: finite(m.momentumPct) ? clamp(m.momentumPct / MOMENTUM_SCALE) : null,
  };
}

export type OracleReading = {
  /** 가중 합산 점수 [-1, 1] */
  S: number;
  /** P(롱) — [P_MIN, P_MAX] 범위 */
  pLong: number;
  /** 계산에 실제 사용된 지표 */
  usedSignals: SignalKey[];
  /** 전 지표 실패 → 순수 운빨 모드 */
  luckMode: boolean;
};

/**
 * S = Σ wᵢ·sᵢ. 실패한 지표는 제외하고 남은 가중치 합으로 재정규화.
 * 전부 실패하면 S=0, P(롱)=0.5 (운빨 모드) — 버튼은 항상 동작해야 한다.
 */
export function computeReading(m: MarketIndicators): OracleReading {
  const signals = computeSignals(m);
  const used = (Object.keys(ORACLE_WEIGHTS) as SignalKey[]).filter((k) =>
    finite(signals[k])
  );

  if (used.length === 0) {
    return { S: 0, pLong: 0.5, usedSignals: [], luckMode: true };
  }

  const totalWeight = used.reduce((sum, k) => sum + ORACLE_WEIGHTS[k], 0);
  const S = used.reduce(
    (sum, k) => sum + (ORACLE_WEIGHTS[k] / totalWeight) * (signals[k] as number),
    0
  );
  const pLong = clamp(P_BASE + P_SLOPE * S, P_MIN, P_MAX);

  return { S, pLong, usedSignals: used, luckMode: false };
}

/** 오차 범위 내 랜덤 추첨. rng 주입으로 테스트 가능. */
export function drawOracle(
  pLong: number,
  rng: () => number = Math.random
): OracleSide {
  return rng() < pLong ? "LONG" : "SHORT";
}

/**
 * S 구간별 "시장 기류" 문구 (스펙 3.2).
 * P값·지표 수치는 결과 화면에 표시하지 않는다 — 이 문구만 노출.
 */
export function currentLabel(S: number): string {
  if (S > 0.3) return "위로 끌어당기는 기류";
  if (S > 0.1) return "롱 쪽으로 살짝 기움";
  if (S >= -0.1) return "팽팽한 줄다리기";
  if (S >= -0.3) return "숏 쪽으로 살짝 기움";
  return "아래로 끌어당기는 기류";
}
