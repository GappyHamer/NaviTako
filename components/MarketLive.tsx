"use client";

import { useEffect, useRef, useState } from "react";
import Gauge from "@/components/Gauge";
import type { MarketData } from "@/lib/market";

/** 60초마다 /api/market을 다시 읽어 지표를 갱신하는 클라이언트 뷰.
 *  서버가 넘겨준 initial로 첫 화면을 그리고, 이후 자동으로 새로고침한다. */

const POLL_MS = 60_000;

function fngEmoji(v: number): string {
  if (v <= 20) return "🥶 극단적 공포";
  if (v <= 40) return "😨 공포";
  if (v <= 60) return "😐 중립";
  if (v <= 80) return "🤑 탐욕";
  return "🔥 극단적 탐욕";
}

/** 롱숏비율 r → 롱 계정 비중(%) */
function ratioToLongPct(r: number): number {
  return (r / (1 + r)) * 100;
}

function agoLabel(sec: number): string {
  if (sec < 3) return "방금 갱신";
  if (sec < 60) return `${sec}초 전 갱신`;
  return `${Math.floor(sec / 60)}분 전 갱신`;
}

const num1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const num0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function MarketLive({ initial }: { initial: MarketData }) {
  const [data, setData] = useState<MarketData>(initial);
  const [ago, setAgo] = useState(0);
  const lastRef = useRef<number>(Date.now());

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

  return (
    <>
      <div className="flex items-center gap-2 text-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="txt-muted">실시간 · {agoLabel(ago)}</span>
      </div>

      {data.allFailed && (
        <p className="txt-warn surface rounded-xl px-4 py-3 text-sm">
          지금은 지표를 불러오지 못했어요. 잠시 뒤 자동으로 다시 시도합니다. 🎲
        </p>
      )}

      <section className="space-y-6">
        {/* 공포탐욕지수 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">공포탐욕지수</h2>
            <span className="txt-accent text-2xl font-bold tabular-nums">
              {indicators.fng !== null ? Math.round(indicators.fng) : "‥"}
            </span>
          </div>
          {indicators.fng !== null ? (
            <>
              <Gauge
                value={indicators.fng}
                leftLabel="0 극단적 공포"
                rightLabel="100 극단적 탐욕"
                barClassName="bg-gradient-to-r from-sky-500 to-orange-500"
              />
              <p className="txt text-sm">{fngEmoji(indicators.fng)}</p>
              <p className="txt-faint text-xs leading-relaxed">
                시장 참여자들의 심리를 0(공포)에서 100(탐욕)까지로 나타낸
                지수예요. 극단적 공포가 바닥 근처에서, 극단적 탐욕이 천장 근처에서
                자주 나타나곤 했습니다.
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="txt-faint text-[10px]">출처: alternative.me</p>
        </article>

        {/* 펀딩비 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">펀딩비 (BTCUSDT 무기한)</h2>
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
                leftLabel="-0.05% 숏 과열"
                rightLabel="+0.05% 롱 과열"
                barClassName={
                  indicators.fundingRate >= 0 ? "bg-orange-500" : "bg-sky-500"
                }
              />
              <p className="txt-faint text-xs leading-relaxed">
                양수면 롱이 숏에게 수수료를 내는 상태(롱 쏠림), 음수면 그
                반대예요. 과열은 종종 반대 방향 움직임의 재료가 됩니다.
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="txt-faint text-[10px]">출처: Binance Futures</p>
        </article>

        {/* 고수 포지션 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">고수(탑 트레이더) 포지션</h2>
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
                leftLabel="숏 우세"
                rightLabel="롱 우세"
                barClassName="bg-emerald-500"
              />
              <p className="txt-faint text-xs leading-relaxed">
                바이낸스 상위 트레이더들의 롱/숏 비율이에요. 1보다 크면 롱이 더
                많다는 뜻이고, Tako는 이 지표를 따라가는 쪽으로 읽습니다.
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="txt-faint text-[10px]">출처: Binance Futures</p>
        </article>

        {/* 전체 계정 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">전체 계정 롱숏 비율</h2>
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
                leftLabel="숏 우세"
                rightLabel="롱 우세"
                barClassName="bg-fuchsia-500"
              />
              <p className="txt-faint text-xs leading-relaxed">
                전체 계정의 롱/숏 쏠림이에요. 개인 투자자 비중이 커서 군중 심리로
                읽히고, Tako는 쏠림의 반대쪽에 무게를 둡니다.
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="txt-faint text-[10px]">출처: Binance Futures</p>
        </article>

        {/* 24h 모멘텀 */}
        <article className="surface space-y-3 rounded-2xl p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="txt-strong font-semibold">24시간 모멘텀 (BTC)</h2>
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
                  현재가 약 ${num0.format(data.lastPrice)}
                </p>
              )}
              <p className="txt-faint text-xs leading-relaxed">
                최근 24시간의 가격 변동률이에요. Tako는 달리는 말에 살짝
                올라타는 쪽(추세 추종)으로 이 지표를 읽습니다.
              </p>
            </>
          ) : (
            <p className="txt-faint text-sm">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="txt-faint text-[10px]">출처: Binance Futures</p>
        </article>
      </section>
    </>
  );
}
