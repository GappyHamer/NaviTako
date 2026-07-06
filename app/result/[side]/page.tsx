import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DISCLAIMER_CARD, SITE_NAME } from "@/config/site";

type Params = { side: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ side: "long" }, { side: "short" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { side } = await params;
  const isLong = side === "long";
  const title = isLong ? "문어의 신탁: LONG 📈" : "문어의 신탁: SHORT 📉";
  const description = `점쟁이 문어가 오늘의 비트코인 점괘로 ${
    isLong ? "롱" : "숏"
  }을 내렸습니다. 당신의 신탁도 받아보세요. (재미용 오락 콘텐츠)`;
  return {
    title,
    description,
    openGraph: { title: `${title} | ${SITE_NAME}`, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { side } = await params;
  if (side !== "long" && side !== "short") notFound();
  const isLong = side === "long";

  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <span className="text-7xl" role="img" aria-label="점쟁이 문어">
        🐙
      </span>
      <p className="text-sm text-slate-400">누군가 받아 간 오늘의 신탁</p>
      <div
        className={`w-full max-w-sm rounded-3xl border p-10 ${
          isLong
            ? "border-emerald-500/40 bg-emerald-950/40"
            : "border-red-500/40 bg-red-950/40"
        }`}
      >
        <p
          className={`text-6xl font-black tracking-tight ${
            isLong ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isLong ? "LONG" : "SHORT"}
        </p>
        <p className="mt-4 text-sm text-slate-300">
          {isLong
            ? "문어가 위쪽 기류를 감지했다고 합니다."
            : "문어가 아래쪽 기류를 감지했다고 합니다."}
        </p>
      </div>
      <p className="max-w-sm text-[11px] leading-relaxed text-slate-500">
        {DISCLAIMER_CARD}
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-transform active:scale-95"
      >
        🔮 나도 신탁 받기
      </Link>
    </section>
  );
}
