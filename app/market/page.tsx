import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Gauge from "@/components/Gauge";
import { getMarketData } from "@/lib/market";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "시장온도 — 지금 비트코인 시장 분위기",
  description:
    "공포탐욕지수, 펀딩비, 롱숏비율, 24시간 모멘텀까지 — 문어가 점괘에 쓰는 실제 시장 지표를 게이지로 한눈에 봅니다. 교육 목적 시각화입니다.",
};

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

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export default async function MarketPage() {
  const data = await getMarketData();
  const { indicators } = data;

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">🌡️ 시장온도</h1>
        <p className="text-sm leading-relaxed text-slate-400">
          문어가 점괘를 내릴 때 실제로 읽는 지표들입니다. 여기서는 교육 목적으로
          수치를 그대로 보여드립니다. 각 지표가 무슨 뜻인지는{" "}
          <Link href="/guide" className="text-violet-400 underline underline-offset-2">
            가이드
          </Link>
          에서, 점괘에 어떻게 반영되는지는{" "}
          <Link
            href="/guide/our-algorithm"
            className="text-violet-400 underline underline-offset-2"
          >
            알고리즘 공개 글
          </Link>
          에서 확인하세요.
        </p>
        {data.allFailed && (
          <p className="rounded-xl bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
            지금은 모든 지표를 불러오지 못했어요. 잠시 후 다시 확인해 주세요. 🎲
          </p>
        )}
      </header>

      <section className="space-y-6">
        {/* 공포탐욕지수 */}
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-100">공포탐욕지수</h2>
            <span className="text-2xl font-bold text-violet-300">
              {indicators.fng !== null ? Math.round(indicators.fng) : "—"}
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
              <p className="text-sm text-slate-300">{fngEmoji(indicators.fng)}</p>
              <p className="text-xs leading-relaxed text-slate-500">
                시장 참여자들의 심리를 0(공포)~100(탐욕)으로 나타낸 지수.
                역사적으로 극단적 공포는 바닥 근처에서, 극단적 탐욕은 천장
                근처에서 자주 나타났습니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="text-[10px] text-slate-600">출처: alternative.me</p>
        </article>

        {/* 펀딩비 */}
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-100">펀딩비 (BTCUSDT 무기한)</h2>
            <span className="text-2xl font-bold text-violet-300">
              {indicators.fundingRate !== null
                ? `${(indicators.fundingRate * 100).toFixed(4)}%`
                : "—"}
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
              <p className="text-xs leading-relaxed text-slate-500">
                양수면 롱 포지션이 숏에게 수수료를 내는 상태(롱 쏠림), 음수면 그
                반대입니다. 과열은 종종 반대 방향 움직임의 재료가 됩니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="text-[10px] text-slate-600">출처: Binance Futures</p>
        </article>

        {/* 고수 포지션 */}
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-100">고수(탑 트레이더) 포지션</h2>
            <span className="text-2xl font-bold text-violet-300">
              {indicators.topRatio !== null
                ? numberFormat.format(indicators.topRatio)
                : "—"}
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
              <p className="text-xs leading-relaxed text-slate-500">
                바이낸스 상위 트레이더들의 롱/숏 포지션 비율. 1보다 크면 롱이 더
                많다는 뜻입니다. 문어는 이 지표를 “따라가는” 쪽으로 읽습니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="text-[10px] text-slate-600">출처: Binance Futures</p>
        </article>

        {/* 전체 계정 */}
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-100">전체 계정 롱숏 비율</h2>
            <span className="text-2xl font-bold text-violet-300">
              {indicators.globalRatio !== null
                ? numberFormat.format(indicators.globalRatio)
                : "—"}
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
              <p className="text-xs leading-relaxed text-slate-500">
                전체 계정의 롱/숏 쏠림. 개인 투자자 비중이 커서 “군중 심리”
                지표로 읽히며, 문어는 쏠림의 반대쪽에 무게를 둡니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="text-[10px] text-slate-600">출처: Binance Futures</p>
        </article>

        {/* 24h 모멘텀 */}
        <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-100">24시간 모멘텀 (BTC)</h2>
            <span
              className={`text-2xl font-bold ${
                (indicators.momentumPct ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {indicators.momentumPct !== null
                ? `${indicators.momentumPct >= 0 ? "+" : ""}${indicators.momentumPct.toFixed(2)}%`
                : "—"}
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
                <p className="text-sm text-slate-300">
                  현재가 약 $
                  {new Intl.NumberFormat("en-US", {
                    maximumFractionDigits: 0,
                  }).format(data.lastPrice)}
                </p>
              )}
              <p className="text-xs leading-relaxed text-slate-500">
                최근 24시간 가격 변동률. 문어는 달리는 말에 살짝 올라타는
                쪽(추세 추종)으로 이 지표를 읽습니다.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">지금은 데이터를 불러오지 못했어요.</p>
          )}
          <p className="text-[10px] text-slate-600">출처: Binance Futures</p>
        </article>
      </section>

      <p className="text-[11px] leading-relaxed text-slate-600">
        본 페이지의 수치는 교육 목적으로 제공되며 60초 주기로 갱신됩니다. 지표
        해석은 참고용일 뿐 투자 판단의 근거가 될 수 없습니다.
      </p>

      {/* 시장온도 하단 광고 슬롯 (스펙 허용 위치) */}
      <AdSlot slot="market-bottom" height={250} />
    </div>
  );
}
