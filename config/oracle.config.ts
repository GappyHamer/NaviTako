/**
 * 신탁 알고리즘 가중치·상수 (스펙 3.2 고정값).
 * 알고리즘 본체는 lib/oracle.ts — 여기서는 숫자만 관리한다.
 */

export const ORACLE_WEIGHTS = {
  /** s1: 공포탐욕 (역발상 — 공포일수록 롱) */
  s1: 0.25,
  /** s2: 펀딩비 (역발상 — 펀딩 과열이면 숏) */
  s2: 0.2,
  /** s3: 고수 포지션 (추종 — 고수가 롱이면 롱) */
  s3: 0.25,
  /** s4: 전체 계정 롱숏 (역발상 — 개미 쏠림 반대) */
  s4: 0.1,
  /** s5: 24h 모멘텀 (추종) */
  s5: 0.2,
} as const;

/** 펀딩비 정규화 스케일: +0.05% (0.0005)에서 포화 */
export const FUNDING_SCALE = 0.0005;

/** 24h 변동률 정규화 스케일: ±5%에서 포화 */
export const MOMENTUM_SCALE = 5;

/** P(롱) = clamp(P_BASE + P_SLOPE·S, P_MIN, P_MAX) */
export const P_BASE = 0.5;
export const P_SLOPE = 0.35;
/** 어느 쪽도 확정 금지 = "오차 범위 내 랜덤" */
export const P_MIN = 0.15;
export const P_MAX = 0.85;
