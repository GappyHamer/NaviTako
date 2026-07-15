"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Gauge from "@/components/Gauge";
import type { MarketData } from "@/lib/market";

/** 60초마다 /api/market을 다시 읽어 지표를 갱신하는 클라이언트 뷰.
 *  서버가 넘겨준 initial로 첫 화면을 그리고, 이후 자동으로 새로고침한다. */

const POLL_MS = 60_000;

/** 롱숏비율 r → 롱 계정 비중(%) */
function ratioToLongPct(r: number): number {
  return (r / (1 + r)) * 100;
}

const num1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const num0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function MarketLive({ initial }: { initial: MarketData }) {
  const t = useTranslations("pages");
  const [data, setData] = useState<MarketData>(initial);
  const [ago, setAgo] = useState(0);
  const lastRef = useRef<number>(Date.now());

  function fngEmoji(v: number): string {
    if (v <= 20) return t("market.fng.f0");
    if (v <= 40) return t("market.fng.f1");
    if (v <= 60) return t("market.fng.f2");
    if (v <= 80) return t("market.fng.f3");
    return t("market.fng.f4");
  }

  function agoLabel(sec: number): string {
    if (sec < 3) return t("market.updatedJustNow");
    if (sec < 60) return t("market.updatedSecAgo", { sec });
    return t("market.updatedMinAgo", { min: Math.floor(sec / 60) });
  }

  useEffect(() => {
    const refetch = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        setData((await res.json()) as MarketData);
        lastRef.current = Date.now();
      } catch {
        // 일시적 실패는 다음 폴링에서 회복 → 이전 값 유지
      }
    };
    const poll = setInterval(refetch, POLL_MS);
    const tick = setInterval(
      () => setAgo(Math.floor((Date.now() - lastRef.current) / 1000)),
      1000
    );
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  const { indicators } = data;
  const dataUnavailable = t("market.dataUnavailable");

  return (
    <>
      <div className="flex items-center gap-2 text-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="txt-muted">
          {t("market.live")} · {agoLabel(ago)}
        </span>
      </div>

      {data.allFailed && (
        <p className="txt-warn surface rounded-xl px-4 py-3 text-sm">
          {t("market.allFailed")}
        </p>
      )}

      <section className="space-y-6">
        {/* 공포탐욕지수 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">{t("market.fng.title")}</h2>
            <span className="txt-accent text-2xl font-bold tabular-nums">
              {indicators.fng !== null ? Math.round(indicators.fng) : "‥"}
            </span>
          </div>
          {indicators.fng !== null ? (
            <>
              <Gauge
                value={indicators.fng}
                leftLabel={t("market.fng.left")}
                rightLabel={t("market.fng.right")}
                barClassName="bg-gradient-to-r from-sky-500 to-orange-500"
              />
              <p className="txt text-sm">{fngEmoji(indicators.fng)}</p>
              <p className="txt-faint text-xs leading-relaxed">
                {t("market.fng.desc")}
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">{dataUnavailable}</p>
          )}
          <p className="txt-faint text-[10px]">
            {t("market.source", { name: "alternative.me" })}
          </p>
        </article>

        {/* 펀딩비 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">
              {t("market.funding.title")}
            </h2>
            <span className="txt-accent text-2xl font-bold tabular-nums">
              {indicators.fundingRate !== null
                ? `${(indicators.fundingRate * 100).toFixed(4)}%`
                : "‥"}
            </span>
          </div>
          {indicators.fundingRate !== null ? (
            <>
              <Gauge
                value={((indicators.fundingRate + 0.0005) / 0.001) * 100}
                leftLabel={t("market.funding.left")}
                rightLabel={t("market.funding.right")}
                barClassName={
                  indicators.fundingRate >= 0 ? "bg-orange-500" : "bg-sky-500"
                }
              />
              <p className="txt-faint text-xs leading-relaxed">
                {t("market.funding.desc")}
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">{dataUnavailable}</p>
          )}
          <p className="txt-faint text-[10px]">
            {t("market.source", { name: "Binance Futures" })}
          </p>
        </article>

        {/* 고수 포지션 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">{t("market.top.title")}</h2>
            <span className="txt-accent text-2xl font-bold tabular-nums">
              {indicators.topRatio !== null
                ? num1.format(indicators.topRatio)
                : "‥"}
            </span>
          </div>
          {indicators.topRatio !== null ? (
            <>
              <Gauge
                value={ratioToLongPct(indicators.topRatio)}
                leftLabel={t("market.shortDominant")}
                rightLabel={t("market.longDominant")}
                barClassName="bg-emerald-500"
              />
              <p className="txt-faint text-xs leading-relaxed">
                {t("market.top.desc")}
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">{dataUnavailable}</p>
          )}
          <p className="txt-faint text-[10px]">
            {t("market.source", { name: "Binance Futures" })}
          </p>
        </article>

        {/* 전체 계정 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">
              {t("market.global.title")}
            </h2>
            <span className="txt-accent text-2xl font-bold tabular-nums">
              {indicators.globalRatio !== null
                ? num1.format(indicators.globalRatio)
                : "‥"}
            </span>
          </div>
          {indicators.globalRatio !== null ? (
            <>
              <Gauge
                value={ratioToLongPct(indicators.globalRatio)}
                leftLabel={t("market.shortDominant")}
                rightLabel={t("market.longDominant")}
                barClassName="bg-orange-500"
              />
              <p className="txt-faint text-xs leading-relaxed">
                {t("market.global.desc")}
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">{dataUnavailable}</p>
          )}
          <p className="txt-faint text-[10px]">
            {t("market.source", { name: "Binance Futures" })}
          </p>
        </article>

        {/* 24h 모멘텀 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">
              {t("market.momentum.title")}
            </h2>
            <span
              className={`text-2xl font-bold tabular-nums ${
                (indicators.momentumPct ?? 0) >= 0 ? "txt-long" : "txt-short"
              }`}
            >
              {indicators.momentumPct !== null
                ? `${indicators.momentumPct >= 0 ? "+" : ""}${indicators.momentumPct.toFixed(2)}%`
                : "‥"}
            </span>
          </div>
          {indicators.momentumPct !== null ? (
            <>
              <Gauge
                value={((indicators.momentumPct + 5) / 10) * 100}
                leftLabel="-5%"
                rightLabel="+5%"
                barClassName={
                  indicators.momentumPct >= 0 ? "bg-emerald-500" : "bg-red-500"
                }
              />
              {data.lastPrice !== null && (
                <p className="txt text-sm">
                  {t("market.momentum.price", {
                    price: num0.format(data.lastPrice),
                  })}
                </p>
              )}
              <p className="txt-faint text-xs leading-relaxed">
                {t("market.momentum.desc")}
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">{dataUnavailable}</p>
          )}
          <p className="txt-faint text-[10px]">
            {t("market.source", { name: "Binance Futures" })}
          </p>
        </article>
      </section>
    </>
  );
}
