import { describe, expect, it } from "vitest";
import {
  clamp,
  computeReading,
  computeSignals,
  currentLabel,
  drawOracle,
  EMPTY_INDICATORS,
  type MarketIndicators,
} from "@/lib/oracle";
import { ORACLE_WEIGHTS, P_MAX, P_MIN } from "@/config/oracle.config";

const base: MarketIndicators = { ...EMPTY_INDICATORS };

describe("clamp", () => {
  it("기본 [-1, 1] 범위를 벗어나면 자른다", () => {
    expect(clamp(5)).toBe(1);
    expect(clamp(-5)).toBe(-1);
    expect(clamp(0.3)).toBe(0.3);
  });

  it("커스텀 범위도 지원한다", () => {
    expect(clamp(0.9, 0.15, 0.85)).toBe(0.85);
    expect(clamp(0.1, 0.15, 0.85)).toBe(0.15);
  });
});

describe("computeSignals — 정규화 (스펙 3.2)", () => {
  it("s1 공포탐욕 역발상: 공포(0)=+1, 탐욕(100)=-1, 중립(50)=0", () => {
    expect(computeSignals({ ...base, fng: 0 }).s1).toBe(1);
    expect(computeSignals({ ...base, fng: 100 }).s1).toBe(-1);
    expect(computeSignals({ ...base, fng: 50 }).s1).toBe(0);
  });

  it("s2 펀딩비 역발상: +0.05% 과열이면 -1, 음수 펀딩이면 롱 편향", () => {
    expect(computeSignals({ ...base, fundingRate: 0.0005 }).s2).toBe(-1);
    expect(computeSignals({ ...base, fundingRate: 0.001 }).s2).toBe(-1); // 포화
    expect(computeSignals({ ...base, fundingRate: -0.0005 }).s2).toBe(1);
    expect(computeSignals({ ...base, fundingRate: 0 }).s2).toBe(-0); // -clamp(0)
  });

  it("s3 고수 포지션 추종: ratio 2 → +1, 0.5 → -1, 1 → 0", () => {
    expect(computeSignals({ ...base, topRatio: 2 }).s3).toBeCloseTo(1);
    expect(computeSignals({ ...base, topRatio: 0.5 }).s3).toBeCloseTo(-1);
    expect(computeSignals({ ...base, topRatio: 1 }).s3).toBeCloseTo(0);
    expect(computeSignals({ ...base, topRatio: 4 }).s3).toBe(1); // 포화
  });

  it("s4 전체 계정 역발상: 개미 롱 쏠림(2) → -1", () => {
    expect(computeSignals({ ...base, globalRatio: 2 }).s4).toBeCloseTo(-1);
    expect(computeSignals({ ...base, globalRatio: 0.5 }).s4).toBeCloseTo(1);
  });

  it("s5 모멘텀 추종: ±5%에서 포화", () => {
    expect(computeSignals({ ...base, momentumPct: 5 }).s5).toBe(1);
    expect(computeSignals({ ...base, momentumPct: 12 }).s5).toBe(1);
    expect(computeSignals({ ...base, momentumPct: -2.5 }).s5).toBe(-0.5);
  });

  it("비정상 값(0 이하 ratio, NaN)은 null 처리한다", () => {
    expect(computeSignals({ ...base, topRatio: 0 }).s3).toBeNull();
    expect(computeSignals({ ...base, topRatio: -1 }).s3).toBeNull();
    expect(computeSignals({ ...base, fng: NaN }).s1).toBeNull();
  });
});

describe("computeReading — 가중 합산·재정규화", () => {
  it("전 지표 성공: S = Σ wᵢ·sᵢ", () => {
    // fng=0(s1=1), funding=-0.0005(s2=1), top=2(s3=1), global=0.5(s4=1), pct=5(s5=1)
    const r = computeReading({
      fng: 0,
      fundingRate: -0.0005,
      topRatio: 2,
      globalRatio: 0.5,
      momentumPct: 5,
    });
    expect(r.S).toBeCloseTo(1);
    expect(r.pLong).toBe(P_MAX); // 0.5 + 0.35 = 0.85
    expect(r.usedSignals).toHaveLength(5);
    expect(r.luckMode).toBe(false);
  });

  it("일부 실패: 남은 가중치 합으로 재정규화한다", () => {
    // s1(w=0.25)=+1, s3(w=0.25)=-1만 성공 → S = (0.5·1 + 0.5·-1) = 0
    const r = computeReading({
      ...base,
      fng: 0,
      topRatio: 0.5,
    });
    expect(r.S).toBeCloseTo(0);
    expect(r.pLong).toBeCloseTo(0.5);
    expect(r.usedSignals).toEqual(["s1", "s3"]);
  });

  it("단일 지표만 성공해도 가중치가 1로 재정규화된다", () => {
    const r = computeReading({ ...base, fng: 0 }); // s1=+1
    expect(r.S).toBeCloseTo(1);
    expect(r.pLong).toBe(P_MAX);
  });

  it("전멸 폴백: 전부 실패하면 P(롱)=0.5 운빨 모드", () => {
    const r = computeReading(EMPTY_INDICATORS);
    expect(r.S).toBe(0);
    expect(r.pLong).toBe(0.5);
    expect(r.usedSignals).toEqual([]);
    expect(r.luckMode).toBe(true);
  });

  it("P(롱)은 어느 쪽도 확정 금지 — [0.15, 0.85] 범위", () => {
    const bullish = computeReading({
      fng: 0,
      fundingRate: -0.001,
      topRatio: 4,
      globalRatio: 0.25,
      momentumPct: 10,
    });
    const bearish = computeReading({
      fng: 100,
      fundingRate: 0.001,
      topRatio: 0.25,
      globalRatio: 4,
      momentumPct: -10,
    });
    expect(bullish.pLong).toBeCloseTo(P_MAX, 10);
    expect(bearish.pLong).toBeCloseTo(P_MIN, 10);
    expect(P_MIN).toBeGreaterThan(0);
    expect(P_MAX).toBeLessThan(1);
  });

  it("가중치 합은 1이다 (스펙 고정값 검증)", () => {
    const sum = Object.values(ORACLE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });
});

describe("drawOracle — 오차 범위 내 랜덤", () => {
  it("rng < pLong이면 LONG, 아니면 SHORT", () => {
    expect(drawOracle(0.7, () => 0.69)).toBe("LONG");
    expect(drawOracle(0.7, () => 0.7)).toBe("SHORT");
    expect(drawOracle(0.15, () => 0.1)).toBe("LONG");
    expect(drawOracle(0.85, () => 0.9)).toBe("SHORT");
  });
});

describe("currentLabel — 시장 기류 문구 (스펙 구간)", () => {
  it("구간별 문구를 반환한다", () => {
    expect(currentLabel(0.5)).toBe("위로 끌어당기는 기류");
    expect(currentLabel(0.2)).toBe("롱 쪽으로 살짝 기움");
    expect(currentLabel(0)).toBe("팽팽한 줄다리기");
    expect(currentLabel(-0.2)).toBe("숏 쪽으로 살짝 기움");
    expect(currentLabel(-0.5)).toBe("아래로 끌어당기는 기류");
  });

  it("경계값 처리", () => {
    expect(currentLabel(0.3)).toBe("롱 쪽으로 살짝 기움");
    expect(currentLabel(0.1)).toBe("팽팽한 줄다리기");
    expect(currentLabel(-0.1)).toBe("팽팽한 줄다리기");
    expect(currentLabel(-0.3)).toBe("숏 쪽으로 살짝 기움");
  });
});
