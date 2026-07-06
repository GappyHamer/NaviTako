import Link from "next/link";
import OracleClient from "@/components/OracleClient";

export default function HomePage() {
  return (
    <>
      {/* h1은 SEO용 — 화면에는 심플하게 노출 */}
      <h1 className="pt-10 text-center text-2xl font-bold text-slate-100 sm:text-3xl">
        오늘의 비트코인 점괘,
        <br className="sm:hidden" /> 롱일까 숏일까?
      </h1>

      <OracleClient />

      {/* 신탁 버튼 근처 광고 금지 — 홈에는 AdSlot을 배치하지 않는다 */}
      <section className="mx-auto max-w-xl space-y-4 pb-10 pt-6 text-sm leading-relaxed text-slate-400">
        <h2 className="text-base font-semibold text-slate-200">
          🐙 이 문어, 그냥 찍는 게 아닙니다
        </h2>
        <p>
          롱숏 신탁의 문어는 <strong className="text-slate-200">실제 시장 지표 5가지</strong>
          (공포탐욕지수, 펀딩비, 고수들의 포지션 비율, 전체 계정 롱숏 비율, 24시간
          모멘텀)를 읽고 확률을 살짝 기울인 뒤, 그 오차 범위 안에서 점괘를
          뽑습니다. 어느 쪽도 확정하지 않는 것이 이 점집의 철칙입니다.
        </p>
        <p>
          계산법이 궁금하다면{" "}
          <Link href="/guide/our-algorithm" className="text-violet-400 underline underline-offset-2">
            알고리즘 전체 공개 글
          </Link>
          에서 수식까지 전부 확인할 수 있고, 지금 시장 분위기는{" "}
          <Link href="/market" className="text-violet-400 underline underline-offset-2">
            시장온도 페이지
          </Link>
          에서 볼 수 있습니다. 물론 이 모든 것은 재미를 위한 오락일 뿐, 투자
          조언이 아닙니다.
        </p>
      </section>
    </>
  );
}
