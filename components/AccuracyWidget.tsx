"use client";

import { useEffect, useState } from "react";

/**
 * Tako 예언 성적표 (재미로 보는).
 *
 * Phase 2: /api/stats 에서 오늘의 롱/숏 분포 + 실제 4h/24h 적중률을 가져온다.
 * 저장소가 연결되지 않았거나 표본이 너무 적으면(<MIN) 시드 기반의 결정론적
 * 재미용 수치로 폴백한다 → 갓 배포한 상태에서도 위젯이 비어 보이지 않는다.
 */

type Tally = { hits: number; total: number };
type Win = "4h" | "24h";
type Period = "all" | "d30" | "d7";

type StatsPayload = {
  connected: boolean;
  distribution: { long: number; short: number; total: number } | null;
  accuracy: Record<Win, { all: Tally; d30: Tally; d7: Tally }>;
};

const MIN_SAMPLES = 12;
const numberFormat = new Intl.NumberFormat("ko-KR");

const WINDOWS: { key: Win; label: string }[] = [
  { key: "4h", label: "4시간 뒤" },
  { key: "24h", label: "24시간 뒤" },
];
const PERIODS: { key: Period; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "d30", label: "최근 30일" },
  { key: "d7", label: "최근 7일" },
];

/** FNV-1a 결정론적 0~1 (Math.random·Date 미사용 → 하이드레이션 안전) */
function seeded(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}
function funAccuracy(key: string): number {
  return 48 + seeded(key) * 11;
}

export default function AccuracyWidget() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [win, setWin] = useState<Win>("24h");
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: StatsPayload | null) => {
        if (alive && d) setStats(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const tally = stats?.accuracy?.[win]?.[period];
  const hasReal = Boolean(stats?.connected && tally && tally.total >= MIN_SAMPLES);
  const acc = hasReal
    ? (tally!.hits / tally!.total) * 100
    : funAccuracy(win + period);
  const isUp = acc >= 50;

  const dist = stats?.distribution;
  const hasDist = Boolean(dist && dist.total > 0);
  const longPct = hasDist ? Math.round((dist!.long / dist!.total) * 100) : 50;
  const shortPct = 100 - longPct;

  return (
    <section
      className="mx-auto w-full max-w-sm rounded-2xl surface p-5"
      aria-label="Tako 예언 성적표"
    >
      <p className="txt-muted text-center text-xs">
        🎯 재미로 보는 Tako 예언 성적표
      </p>

      {/* 오늘의 예언 분포 */}
      <div className="mt-4">
        <div className="txt-faint flex items-center justify-between text-[11px]">
          <span>오늘의 예언 분포</span>
          <span>
            {hasDist ? `총 ${numberFormat.format(dist!.total)}회` : "집계 중"}
          </span>
        </div>
        {hasDist ? (
          <>
            <div className="mt-1.5 flex h-3 overflow-hidden rounded-full">
              <div
                className="bg-emerald-500"
                style={{ width: `${longPct}%` }}
              />
              <div className="bg-red-500" style={{ width: `${shortPct}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-semibold">
              <span className="txt-long">롱 {longPct}%</span>
              <span className="txt-short">숏 {shortPct}%</span>
            </div>
          </>
        ) : (
          <p className="txt-faint mt-1.5 text-center text-xs">
            오늘의 첫 예언을 기다리는 중이에요.
          </p>
        )}
      </div>

      <hr className="border-app my-4" />

      {/* 적중률 */}
      <div className="text-center">
        <div className="flex justify-center gap-1.5">
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => setWin(w.key)}
              aria-pressed={w.key === win}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                w.key === win ? "btn-accent" : "surface txt-muted hover:opacity-80"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        <p
          className={`mt-2.5 text-4xl font-black tabular-nums ${
            isUp ? "txt-long" : "txt-short"
          }`}
        >
          {acc.toFixed(1)}%
        </p>
        <p className="txt-faint mt-1 text-xs">
          {hasReal
            ? `예언 ${numberFormat.format(tally!.total)}건 중 ${numberFormat.format(tally!.hits)}건 적중`
            : "아직 집계 전이라 재미로 보여드려요"}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              aria-pressed={p.key === period}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                p.key === period
                  ? "btn-accent"
                  : "surface txt-muted hover:opacity-80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="txt-faint mt-3 text-center text-[10px] leading-relaxed">
        * 예언 시점 가격 대비 방향이 맞았는지를 집계한 오락용 통계입니다. 실제
        수익률과 무관하고, 문어의 예언은 동전 던지기에 가깝다는 걸 잊지 마세요.
      </p>
    </section>
  );
}
