"use client";

import { useState } from "react";

/**
 * "재미로 보는" 예언 적중률 위젯. 시간 단위 탭으로 전환한다.
 *
 * Phase 1은 DB가 없어 실제 적중 기록을 저장하지 않는다. 여기 수치는
 * 단위 키로 시드한 결정론적 유사통계(동전 던지기 근처)로, 새로고침해도
 * 값이 흔들리지 않는다. 실제 시장 수익률과는 무관한 오락용 표시다.
 * (Phase 2에서 Redis + Cron으로 진짜 적중률로 교체 가능)
 */

type Unit = { key: string; label: string; samples: number };

const UNITS: readonly Unit[] = [
  { key: "hour", label: "시간", samples: 118 },
  { key: "day", label: "일", samples: 2_940 },
  { key: "week", label: "주", samples: 20_600 },
  { key: "month", label: "달", samples: 88_300 },
  { key: "year", label: "연", samples: 1_060_000 },
  { key: "all", label: "전체", samples: 3_420_000 },
];

/** FNV-1a 기반 결정론적 0~1 난수 (Math.random·Date 미사용 → 하이드레이션 안전) */
function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

/** 48.0% ~ 59.0% 사이의 그럴듯한 값 */
function accuracyOf(key: string): number {
  return 48 + seeded(key) * 11;
}

const numberFormat = new Intl.NumberFormat("ko-KR");

export default function AccuracyWidget() {
  const [unit, setUnit] = useState<Unit>(UNITS[5]);
  const acc = accuracyOf(unit.key);
  const isUp = acc >= 50;

  return (
    <section
      className="mx-auto w-full max-w-sm rounded-2xl surface p-5 text-center"
      aria-label="재미로 보는 예언 적중률"
    >
      <p className="txt-muted text-xs">🎯 재미로 보는 Tako 예언 적중률</p>

      <p
        className={`mt-1.5 text-4xl font-black tabular-nums ${
          isUp ? "txt-long" : "txt-short"
        }`}
      >
        {acc.toFixed(1)}%
      </p>
      <p className="txt-faint mt-1 text-xs">
        최근 {unit.label} 기준 · 예언 {numberFormat.format(unit.samples)}회 집계
      </p>

      <div
        className="mt-3 flex flex-wrap justify-center gap-1.5"
        role="tablist"
        aria-label="집계 기간"
      >
        {UNITS.map((u) => {
          const active = u.key === unit.key;
          return (
            <button
              key={u.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setUnit(u)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "btn-accent"
                  : "surface txt-muted hover:opacity-80"
              }`}
            >
              {u.label}
            </button>
          );
        })}
      </div>

      <p className="txt-faint mt-3 text-[10px] leading-relaxed">
        * 실제 시장 수익률과 무관한 오락용 표시입니다. 문어의 예언은 동전
        던지기에 가깝다는 걸 잊지 마세요.
      </p>
    </section>
  );
}
