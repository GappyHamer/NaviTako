import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { contactBotEnabled } from "@/lib/telegram";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("contact.metaTitle"),
    description: t("contact.metaDescription"),
  };
}

export default async function ContactPage({
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
        <h1 className="txt-strong text-2xl font-bold">{t("contact.heading")}</h1>
        <p className="txt-muted text-sm leading-relaxed">
          {t("contact.intro")}
        </p>
      </header>

      <section className="space-y-4">
        {!contactBotEnabled && (
          <p className="txt-faint text-xs">{t("contact.disabledNotice")}</p>
        )}
        <ContactForm />
      </section>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("contact.acceptHeading")}
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t("contact.accept1")}</li>
            <li>{t("contact.accept2")}</li>
            <li>{t("contact.accept3")}</li>
            <li>{t("contact.accept4")}</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            {t("contact.hardHeading")}
          </h2>
          <p>
            {t.rich("contact.hardBody", {
              disclaimer: (chunks) => (
                <Link href="/disclaimer" className="link-accent">
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
