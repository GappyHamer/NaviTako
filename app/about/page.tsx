import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "소개",
  description:
    "롱숏 예언은 실제 시장 지표로 확률을 살짝 기울여 비트코인 롱/숏을 예언하는 오락 사이트입니다. 만든 이유와 작동 원리를 소개해요.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong flex items-center gap-2 text-2xl font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/octopus.png" alt="" width={30} height={30} className="h-7 w-7" />
          {SITE_NAME} 소개
        </h1>
      </header>

      <section className="txt space-y-4 text-sm leading-relaxed">
        <h2 className="txt-strong text-lg font-semibold">
          이 사이트는 뭘 하는 곳인가요?
        </h2>
        <p>
          {SITE_NAME}은 버튼을 누르면 예언가 문어 Tako가 비트코인 선물의
          롱(상승)과 숏(하락) 중 하나를 예언으로 내려주는{" "}
          <strong>오락 사이트</strong>예요. 운세 뽑듯 가볍게 즐기는
          콘텐츠이고, 투자 조언이나 매매 신호는 아닙니다.
        </p>

        <h2 className="txt-strong text-lg font-semibold">
          그냥 랜덤인가요?
        </h2>
        <p>
          절반은 맞고 절반은 아니에요. Tako는 공포탐욕지수, 펀딩비, 상위
          트레이더 포지션 비율, 전체 계정 롱숏 비율, 24시간 모멘텀까지 다섯
          가지 실제 시장 지표를 읽고 확률을 <em>살짝</em> 기울입니다. 다만 어떤
          경우에도 한쪽 확률이 15%에서 85% 범위를 벗어나지 않게 설계되어 있어서,
          결과는 언제나 오차 범위 안의 무작위예요. 계산 과정이 궁금하면{" "}
          <Link href="/guide/our-algorithm" className="link-accent">
            알고리즘 전체 공개 글
          </Link>
          에서 수식까지 다 볼 수 있습니다.
        </p>

        <h2 className="txt-strong text-lg font-semibold">왜 만들었나요?</h2>
        <p>
          크립토 커뮤니티에는 &ldquo;롱이냐 숏이냐&rdquo;를 두고 동전을 던지는
          농담이 예전부터 있었어요. 이왕 던질 동전이라면 실제 시장 데이터를 읽는
          문어가 던져주면 더 재미있지 않을까, 그런 생각에서 출발했습니다. 동시에
          공포탐욕지수나 펀딩비 같은 지표를 처음 접하는 분들이{" "}
          <Link href="/guide" className="link-accent">
            가이드
          </Link>
          로 개념을 쉽게 익힐 수 있도록 교육 콘텐츠도 함께 준비했어요.
        </p>

        <h2 className="txt-strong text-lg font-semibold">꼭 기억해 주세요</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>모든 결과는 재미를 위한 오락 콘텐츠입니다.</li>
          <li>사이트의 어떤 내용도 투자 권유나 자문이 아니에요.</li>
          <li>선물·레버리지 거래는 원금 전액을 잃을 수 있는 고위험 거래입니다.</li>
          <li>투자 판단과 그 결과에 대한 책임은 전적으로 본인에게 있어요.</li>
        </ul>

        <h2 className="txt-strong text-lg font-semibold">문의</h2>
        <p>
          제안이나 오류 제보, 기타 문의는{" "}
          <Link href="/contact" className="link-accent">
            문의 페이지
          </Link>
          를 이용해 주세요.
        </p>
      </section>
    </div>
  );
}
