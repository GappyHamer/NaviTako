import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import OracleClient from "@/components/OracleClient";
import AccuracyWidget from "@/components/AccuracyWidget";
import HeroTitle from "@/components/HeroTitle";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("homeAlgo");

  return (
    <div className="flex flex-col items-stretch gap-8 sm:gap-12">
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
        <h2 className="txt-strong text-base font-semibold">{t("heading")}</h2>
        <p className="txt-muted">{t("p1")}</p>
        <p className="txt-muted">
          {t.rich("p2", {
            algo: (chunks) => (
              <Link href="/guide/our-algorithm" className="link-accent">
                {chunks}
              </Link>
            ),
            market: (chunks) => (
              <Link href="/market" className="link-accent">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </div>
  );
}
