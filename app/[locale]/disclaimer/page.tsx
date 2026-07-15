import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DISCLAIMER_CARD, DISCLAIMER_FOOTER, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "면책조항",
  description:
    "롱숏 예언은 오락 목적의 콘텐츠를 제공하며 투자 자문을 하지 않습니다. 서비스 이용 전 면책조항을 꼭 확인해 주세요.",
};

export default async function DisclaimerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">⚖️ 면책조항</h1>
      </header>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="txt-warn rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          {DISCLAIMER_FOOTER}
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            1. 오락 목적의 서비스
          </h2>
          <p>
            {SITE_NAME}이 제공하는 모든 결과(&ldquo;예언&rdquo;)와 콘텐츠는
            재미를 위한 오락물입니다. 결과는 시장 지표를 참고해 확률을 기울인{" "}
            <strong>무작위 추첨</strong>으로 생성되며, 미래 가격에 대한 예측이나
            분석, 전망이 아니에요.
          </p>
          <p className="txt-muted">{DISCLAIMER_CARD}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">2. 투자 자문이 아님</h2>
          <p>
            사이트의 어떤 내용도 금융투자상품의 매매 권유, 투자 자문, 투자 일임에
            해당하지 않습니다. 운영자는 금융투자업 인가를 받지 않았으며, 특정
            종목이나 포지션, 시점에 대한 조언을 제공하지 않아요. 모든 투자 결정과
            그 결과에 대한 책임은 이용자 본인에게 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">3. 고위험 거래 경고</h2>
          <p>
            암호화폐 선물·레버리지 거래는 가격 변동성이 매우 크고, 레버리지 배수에
            따라 원금 전액(또는 그 이상)을 잃을 수 있는 고위험 거래입니다. 원금
            손실을 감당할 수 없다면 거래에 참여하지 않는 것이 원칙이에요.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">4. 정보의 정확성</h2>
          <p>
            사이트가 표시하는 시장 지표는 alternative.me, Binance 등 외부 공개
            API에서 가져오며, 지연이나 오류, 누락이 있을 수 있습니다. 사이트는
            표시되는 정보의 정확성과 완전성, 적시성을 보증하지 않아요.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">5. 책임의 제한</h2>
          <p>
            법이 허용하는 최대 범위 안에서, 운영자는 사이트 이용 또는 이용
            불능으로 발생하는 직접적·간접적 손해(투자 손실 포함)에 대해 어떠한
            책임도 지지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">6. 외부 링크</h2>
          <p>
            사이트에 포함된 외부 링크는 정보 제공 목적이며, 링크된 사이트의 내용에
            대해 운영자는 책임지지 않습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
