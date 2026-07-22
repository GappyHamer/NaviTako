import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllGuideMeta } from "@/lib/guide";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("guideList.metaTitle"),
    description: t("guideList.metaDescription"),
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  const guides = getAllGuideMeta(locale);

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">
          {t("guideList.heading")}
        </h1>
        <p className="txt-muted text-sm leading-relaxed">
          {t("guideList.intro")}
        </p>
      </header>

      <ul className="space-y-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="surface press-spring block rounded-2xl p-5 transition-opacity hover:opacity-80"
            >
              <div className="flex items-baseline gap-3">
                <span className="txt-accent text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <h2 className="txt-strong font-semibold">{guide.title}</h2>
                  <p className="txt-muted text-sm leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
