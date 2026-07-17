"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import PredictionChart from "@/components/PredictionChart";

/**
 * Tako 예언 성적표 (재미로 보는).
 *
 * 컨셉: "장난인데 의외로 좀 맞네?" 하는 반응을 노린다. 큰 적중률 숫자 + 값에
 * 따라 바뀌는 리액션 한 줄로 재미를 준다.
 *
 * 데이터: /api/stats 에서 오늘 롱/숏 분포 + 실제 적중률(시간·일·주·월·연·전체). 저장소
 * 미연결이나 표본 부족(<MIN) 이면 시드 기반 결정론적 값으로 폴백한다(비어 보이지 않게).
 */

type Tally = { hits: number; total: number };
type Win = "1h" | "1d" | "1w" | "1mo" | "1y" | "all";

type StatsPayload = {
  connected: boolean;
  distribution: { long: number; short: number; total: number } | null;
  accuracy: Record<Win, Tally>;
};

const MIN_SAMPLES = 8;

const WINDOW_KEYS: Win[] = ["1h", "1d", "1w", "1mo", "1y", "all"];

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
  return 49 + seeded(key) * 9;
}

export default function AccuracyWidget() {
  const t = useTranslations("oracle");
  const locale = useLocale();
  const numberFormat = new Intl.NumberFormat(locale);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [win, setWin] = useState<Win>("1d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) setStats((await res.json()) as StatsPayload);
    } catch {
      // 무시 (이전 값 유지)
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const tally = stats?.accuracy?.[win];
  const hasReal = Boolean(stats?.connected && tally && tally.total >= MIN_SAMPLES);
  const acc = hasReal ? (tally!.hits / tally!.total) * 100 : funAccuracy(win);
  const isUp = acc >= 50;

  const dist = stats?.distribution;
  const hasDist = Boolean(dist && dist.total > 0);
  const longPct = hasDist ? Math.round((dist!.long / dist!.total) * 100) : 50;
  const shortPct = 100 - longPct;

  return (
    <section
      className="mx-auto w-full max-w-sm rounded-2xl surface p-5"
      aria-label={t("accuracy.sectionAria")}
    >
      <p className="txt-muted text-center text-xs">
        🎯 {t("accuracy.title")}
      </p>

      {/* 오늘의 예언 분포 (+ 새로고침) */}
      <div className="mt-4">
        <div className="txt-faint flex items-center justify-between text-[11px]">
          <span>{t("accuracy.distribution")}</span>
          <span className="flex items-center gap-1.5">
            <span>
              {hasDist
                ? t("accuracy.totalCount", { n: numberFormat.format(dist!.total) })
                : t("accuracy.aggregating")}
            </span>
            <button
              type="button"
              onClick={() => void fetchStats()}
              disabled={refreshing}
              aria-label={t("accuracy.refresh")}
              title={t("accuracy.refresh")}
              className="grid h-5 w-5 place-items-center rounded-full hover:opacity-70 disabled:opacity-40"
            >
              <span className={refreshing ? "inline-block animate-spin" : ""}>
                🔄
              </span>
            </button>
          </span>
        </div>
        {hasDist ? (
          <>
            <div className="mt-1.5 flex h-3 overflow-hidden rounded-full">
              <div className="bg-emerald-500" style={{ width: `${longPct}%` }} />
              <div className="bg-red-500" style={{ width: `${shortPct}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-semibold">
              <span className="txt-long">{t("accuracy.longPct", { n: longPct })}</span>
              <span className="txt-short">{t("accuracy.shortPct", { n: shortPct })}</span>
            </div>
          </>
        ) : (
          <p className="txt-faint mt-1.5 text-center text-xs">
            {t("accuracy.waitingFirst")}
          </p>
        )}
      </div>

      <hr className="border-app my-4" />

      {/* 적중률 */}
      <div className="text-center">
        <p
          className={`text-5xl font-black tabular-nums ${
            isUp ? "txt-long" : "txt-short"
          }`}
        >
          {acc.toFixed(1)}%
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {WINDOW_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setWin(key)}
              aria-pressed={key === win}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                key === win ? "btn-accent" : "surface txt-muted hover:opacity-80"
              }`}
            >
              {t(`accuracy.win.${key}`)}
            </button>
          ))}
        </div>

        <p className="txt-faint mt-2 text-xs">
          {hasReal
            ? t("accuracy.hitSummary", {
                total: numberFormat.format(tally!.total),
                hits: numberFormat.format(tally!.hits),
              })
            : t("accuracy.previewNote")}
        </p>
      </div>

      <hr className="border-app my-4" />

      {/* 예언 차트 — 가격 선 위에 예언 시점 마커(적중=초록/빗나감=빨강) */}
      <PredictionChart />

      <p className="txt-faint mt-3 text-center text-[10px] leading-relaxed">
        {t("accuracy.disclaimer")}
      </p>
    </section>
  );
}
