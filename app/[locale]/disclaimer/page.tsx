import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DISCLAIMER_CARD, DISCLAIMER_FOOTER } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("disclaimer.metaTitle"),
    description: t("disclaimer.metaDescription"),
  };
}

export default async function DisclaimerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">
          {t("disclaimer.heading")}
        </h1>
      </header>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="txt-warn rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          {DISCLAIMER_FOOTER}
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s1Title")}
          </h2>
          <p>
            {t.rich("disclaimer.s1Body", {
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p className="txt-muted">{DISCLAIMER_CARD}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s2Title")}
          </h2>
          <p>{t("disclaimer.s2Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s3Title")}
          </h2>
          <p>{t("disclaimer.s3Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s4Title")}
          </h2>
          <p>{t("disclaimer.s4Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s5Title")}
          </h2>
          <p>{t("disclaimer.s5Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("disclaimer.s6Title")}
          </h2>
          <p>{t("disclaimer.s6Body")}</p>
        </div>
      </section>
    </div>
  );
}
