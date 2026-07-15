import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AdSlot from "@/components/AdSlot";
import MarketLive from "@/components/MarketLive";
import { getMarketData } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("market.metaTitle"),
    description: t("market.metaDescription"),
  };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  const data = await getMarketData();

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">{t("market.heading")}</h1>
        <p className="txt-muted text-sm leading-relaxed">
          {t.rich("market.intro", {
            guide: (chunks) => (
              <Link href="/guide" className="link-accent">
                {chunks}
              </Link>
            ),
            algo: (chunks) => (
              <Link href="/guide/our-algorithm" className="link-accent">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </header>

      <MarketLive initial={data} />

      <p className="txt-faint text-[11px] leading-relaxed">
        {t("market.footnote")}
      </p>

      {/* 시장온도 하단 광고 슬롯 (스펙 허용 위치) */}
      <AdSlot slot="market-bottom" height={250} />
    </div>
  );
}
