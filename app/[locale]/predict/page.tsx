import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import PredictClient from "@/components/PredictClient";

export const metadata: Metadata = {
  title: "내 예언 · 리더보드",
  description:
    "내가 직접 비트코인 롱/숏을 예측하고, 얼마나 맞히는지 리더보드로 겨뤄보세요. 하루 한 번, 재미로 보는 예측 게임입니다.",
};

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
