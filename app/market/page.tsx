import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import MarketLive from "@/components/MarketLive";
import { getMarketData } from "@/lib/market";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "시장온도, 지금 비트코인 시장 분위기",
  description:
    "공포탐욕지수, 펀딩비, 롱숏비율, 24시간 모멘텀까지. Tako가 예언에 쓰는 실제 시장 지표를 게이지로 한눈에 봅니다. 60초마다 자동으로 갱신되는 교육용 시각화예요.",
};

export default async function MarketPage() {
  const data = await getMarketData();

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">🌡️ 시장온도</h1>
        <p className="txt-muted text-sm leading-relaxed">
          Tako가 예언을 내릴 때 실제로 읽는 지표들이에요. 여기서는 교육 목적으로
          수치를 그대로 보여드립니다. 각 지표가 무슨 뜻인지는{" "}
          <Link href="/guide" className="link-accent">
            가이드
          </Link>
          에서, 예언에 어떻게 반영되는지는{" "}
          <Link href="/guide/our-algorithm" className="link-accent">
            알고리즘 공개 글
          </Link>
          에서 확인할 수 있어요.
        </p>
      </header>

      <MarketLive initial={data} />

      <p className="txt-faint text-[11px] leading-relaxed">
        이 페이지의 수치는 교육 목적으로 제공되며 약 60초 주기로 갱신됩니다.
        지표 해석은 참고용일 뿐 투자 판단의 근거가 될 수 없어요.
      </p>

      {/* 시장온도 하단 광고 슬롯 (스펙 허용 위치) */}
      <AdSlot slot="market-bottom" height={250} />
    </div>
  );
}
