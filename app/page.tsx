import Link from "next/link";
import OracleClient from "@/components/OracleClient";
import AccuracyWidget from "@/components/AccuracyWidget";
import HeroTitle from "@/components/HeroTitle";

export default function HomePage() {
  return (
    <div className="flex flex-col items-stretch gap-16 sm:gap-24">
      <HeroTitle />

      <OracleClient />

      {/* 버튼 아래 재미로 보는 적중률 */}
      <div className="pb-4">
        <AccuracyWidget />
      </div>

      {/*
        알고리즘 설명은 예언 버튼과 확실히 간격을 두고, 불투명도를 낮춰
        몰입을 방해하지 않게 한다. (신탁 버튼 근처 광고 금지 → 홈엔 AdSlot 없음)
      */}
      <section className="mx-auto mt-24 max-w-xl space-y-4 pb-16 text-sm leading-relaxed opacity-70">
        <h2 className="txt-strong text-base font-semibold">
          🐙 Tako, 그냥 찍는 게 아니에요
        </h2>
        <p className="txt-muted">
          Tako는 실제 시장 지표 다섯 가지를 읽습니다. 공포탐욕지수, 펀딩비,
          고수들의 포지션 비율, 전체 계정 롱숏 비율, 그리고 24시간 모멘텀이죠.
          이 값들로 확률을 살짝 기울인 다음 그 오차 범위 안에서 롱과 숏 중
          하나를 뽑아요. 어느 쪽도 100%로 확정하지 않는 게 이 예언의 유일한
          원칙입니다.
        </p>
        <p className="txt-muted">
          계산법이 궁금하면{" "}
          <Link href="/guide/our-algorithm" className="link-accent">
            알고리즘 전체 공개 글
          </Link>
          에서 수식까지 볼 수 있고, 지금 시장 분위기는{" "}
          <Link href="/market" className="link-accent">
            시장온도 페이지
          </Link>
          에서 확인할 수 있어요. 물론 이 모든 건 재미로 보는 오락이지 투자
          조언은 아닙니다.
        </p>
      </section>
    </div>
  );
}
