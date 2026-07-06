import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "소개",
  description:
    "롱숏 신탁은 실제 시장 지표로 확률을 살짝 기울여 비트코인 롱/숏 점괘를 내려주는 오락 사이트입니다. 만든 이유와 작동 원리를 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">🐙 {SITE_NAME} 소개</h1>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-300">
        <h2 className="text-lg font-semibold text-slate-100">
          이 사이트는 무엇인가요?
        </h2>
        <p>
          {SITE_NAME}은 버튼을 누르면 심해의 점쟁이 문어가 비트코인 선물의
          롱(상승)과 숏(하락) 중 하나를 &ldquo;신탁&rdquo;으로 내려주는{" "}
          <strong className="text-slate-100">오락 사이트</strong>입니다. 점집에서
          점괘를 뽑듯 가볍게 즐기는 콘텐츠이며, 투자 조언이나 매매 신호가
          아닙니다.
        </p>

        <h2 className="text-lg font-semibold text-slate-100">
          순수 랜덤인가요?
        </h2>
        <p>
          절반은 맞고 절반은 아닙니다. 문어는 공포탐욕지수, 펀딩비, 상위
          트레이더 포지션 비율, 전체 계정 롱숏 비율, 24시간 모멘텀 — 다섯 가지
          실제 시장 지표를 읽고 확률을 <em>살짝</em> 기울입니다. 다만 어떤
          경우에도 한쪽 확률이 15%~85% 범위를 벗어나지 않도록 설계되어 있어,
          결과는 언제나 &ldquo;오차 범위 안의 랜덤&rdquo;입니다. 계산 과정이
          궁금하다면{" "}
          <Link
            href="/guide/our-algorithm"
            className="text-violet-400 underline underline-offset-2"
          >
            알고리즘 전체 공개 글
          </Link>
          에서 수식까지 모두 확인할 수 있습니다.
        </p>

        <h2 className="text-lg font-semibold text-slate-100">왜 만들었나요?</h2>
        <p>
          크립토 커뮤니티에는 &ldquo;롱이냐 숏이냐&rdquo;를 두고 동전을 던지는
          농담이 오래전부터 있었습니다. 이왕 던질 동전이라면 실제 시장 데이터를
          읽는 문어가 던져주면 더 재미있지 않을까 — 하는 생각에서
          출발했습니다. 동시에 공포탐욕지수나 펀딩비 같은 지표를 처음 접하는
          분들이{" "}
          <Link href="/guide" className="text-violet-400 underline underline-offset-2">
            가이드
          </Link>
          를 통해 개념을 쉽게 배울 수 있도록 교육 콘텐츠를 함께 제공합니다.
        </p>

        <h2 className="text-lg font-semibold text-slate-100">
          꼭 기억해 주세요
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>모든 결과는 재미를 위한 오락 콘텐츠입니다.</li>
          <li>사이트의 어떤 내용도 투자 권유·자문이 아닙니다.</li>
          <li>선물·레버리지 거래는 원금 전액을 잃을 수 있는 고위험 거래입니다.</li>
          <li>투자 판단과 그 결과에 대한 책임은 전적으로 본인에게 있습니다.</li>
        </ul>

        <h2 className="text-lg font-semibold text-slate-100">문의</h2>
        <p>
          제안·오류 제보·기타 문의는{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-violet-400 underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          또는 <Link href="/contact" className="text-violet-400 underline underline-offset-2">문의 페이지</Link>를 이용해 주세요.
        </p>
      </section>
    </div>
  );
}
