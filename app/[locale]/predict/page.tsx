import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PredictClient from "@/components/PredictClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: t("predict.metaTitle"),
    description: t("predict.metaDescription"),
  };
}

export default async function PredictPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="py-10 space-y-8">
      <PredictClient />
    </div>
  );
}
