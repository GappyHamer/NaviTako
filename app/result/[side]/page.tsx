import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DISCLAIMER_CARD, SITE_NAME, SITE_URL } from "@/config/site";

type Params = { side: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ side: "long" }, { side: "short" }];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ k?: string }>;
}): Promise<Metadata> {
  const { side } = await params;
  const k = (await searchParams).k ?? "";
  const isLong = side === "long";
  const title = isLong ? "Tako의 예언: LONG 📈" : "Tako의 예언: SHORT 📉";
  const description = `예언가 문어 Tako가 오늘의 비트코인 예언으로 ${
    isLong ? "롱" : "숏"
  }을 내렸어요. 당신의 예언도 받아보세요. (재미로 보는 오락 콘텐츠)`;
  const ogImg = `${SITE_URL}/api/og?side=${side}&k=${encodeURIComponent(k)}`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: ogImg, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
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
      <span className="octo text-7xl" role="img" aria-label="예언가 문어 Tako">
        🐙
      </span>
      <p className="txt-muted text-sm">누군가 받아 간 오늘의 예언</p>
      <div
        className={`w-full max-w-sm rounded-3xl border p-10 ${
          isLong
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-red-500/40 bg-red-500/10"
        }`}
      >
        <p
          className={`text-6xl font-black tracking-tight ${
            isLong ? "txt-long" : "txt-short"
          }`}
        >
          {isLong ? "LONG" : "SHORT"}
        </p>
        <p className="txt mt-4 text-sm">
          {isLong
            ? "Tako가 위쪽 기류를 감지했다고 하네요."
            : "Tako가 아래쪽 기류를 감지했다고 하네요."}
        </p>
      </div>
      <p className="txt-faint max-w-sm text-[11px] leading-relaxed">
        {DISCLAIMER_CARD}
      </p>
      <Link
        href="/"
        className="btn-accent rounded-2xl px-10 py-4 text-lg font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-transform active:scale-95"
      >
        🔮 나도 예언 받기
      </Link>
    </section>
  );
}
