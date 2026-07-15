import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("privacy.metaTitle"),
    description: t("privacy.metaDescription"),
  };
}

export default async function PrivacyPage({
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
        <h1 className="txt-strong text-2xl font-bold">{t("privacy.heading")}</h1>
        <p className="txt-faint text-xs">{t("privacy.effectiveDate")}</p>
      </header>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s1Title")}
          </h2>
          <p>{t("privacy.s1Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s2Title")}
          </h2>
          <p>{t("privacy.s2Body1")}</p>
          <p>{t("privacy.s2Body2")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s3Title")}
          </h2>
          <p>{t("privacy.s3Intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {t.rich("privacy.s3Ga", {
                b: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
            <li>
              {t.rich("privacy.s3Ads", {
                b: (chunks) => <strong>{chunks}</strong>,
              })}
            </li>
          </ul>
          <p>
            {t.rich("privacy.s3Body2", {
              adsettings: (chunks) => (
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  {chunks}
                </a>
              ),
              aboutads: (chunks) => (
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s4Title")}
          </h2>
          <p>{t("privacy.s4Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s5Title")}
          </h2>
          <p>{t("privacy.s5Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s6Title")}
          </h2>
          <p>{t("privacy.s6Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s7Title")}
          </h2>
          <p>{t("privacy.s7Body")}</p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("privacy.s8Title")}
          </h2>
          <p>
            {t.rich("privacy.s8Body", {
              contact: (chunks) => (
                <Link href="/contact" className="link-accent">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
