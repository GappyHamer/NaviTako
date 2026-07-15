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
    title: t("about.metaTitle"),
    description: t("about.metaDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div className="space-y-10 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong flex items-center gap-2 text-2xl font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/octopus.png" alt="" width={30} height={30} className="h-7 w-7" />
          {t("about.heading")}
        </h1>
      </header>

      <section className="txt space-y-4 text-sm leading-relaxed">
        <h2 className="txt-strong text-lg font-semibold">{t("about.q1Title")}</h2>
        <p>
          {t.rich("about.q1Body", {
            b: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>

        <h2 className="txt-strong text-lg font-semibold">{t("about.q2Title")}</h2>
        <p>
          {t.rich("about.q2Body", {
            em: (chunks) => <em>{chunks}</em>,
            algo: (chunks) => (
              <Link href="/guide/our-algorithm" className="link-accent">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <h2 className="txt-strong text-lg font-semibold">{t("about.q3Title")}</h2>
        <p>
          {t.rich("about.q3Body", {
            guide: (chunks) => (
              <Link href="/guide" className="link-accent">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <h2 className="txt-strong text-lg font-semibold">{t("about.q4Title")}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("about.remember1")}</li>
          <li>{t("about.remember2")}</li>
          <li>{t("about.remember3")}</li>
          <li>{t("about.remember4")}</li>
        </ul>

        <h2 className="txt-strong text-lg font-semibold">{t("about.q5Title")}</h2>
        <p>
          {t.rich("about.q5Body", {
            contact: (chunks) => (
              <Link href="/contact" className="link-accent">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </div>
  );
}
