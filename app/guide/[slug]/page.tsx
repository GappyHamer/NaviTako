import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import { DISCLAIMER_GUIDE } from "@/config/site";
import { getAllGuideMeta, getGuideArticle, getGuideSlugs } from "@/lib/guide";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: { title: article.title, description: article.description },
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getGuideArticle(slug);
  if (!article) notFound();

  // 이전/다음 글 내비게이션
  const all = getAllGuideMeta();
  const index = all.findIndex((g) => g.slug === slug);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  return (
    <div className="space-y-8 py-10">
      <nav className="txt-faint text-xs">
        <Link href="/guide" className="hover:opacity-80">
          ← 가이드 목록으로
        </Link>
      </nav>

      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="txt-strong text-2xl font-bold leading-snug">
            {article.title}
          </h1>
          <p className="txt-muted text-sm">{article.description}</p>
        </header>

        {/* 가이드 글 상단 광고 (스펙 허용 위치) */}
        <AdSlot slot="guide-top" height={100} />

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.htmlParts[0] }}
        />

        {article.htmlParts.length > 1 && (
          <>
            {/* 가이드 글 중단 광고 */}
            <AdSlot slot="guide-middle" height={250} />
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.htmlParts[1] }}
            />
          </>
        )}

        <p className="surface txt-faint rounded-xl px-4 py-3 text-xs leading-relaxed">
          {DISCLAIMER_GUIDE}
        </p>

        {/* 가이드 글 하단 광고 */}
        <AdSlot slot="guide-bottom" height={250} />
      </article>

      <nav className="border-app flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        {prev ? (
          <Link
            href={`/guide/${prev.slug}`}
            className="link-accent text-sm no-underline hover:underline"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/guide/${next.slug}`}
            className="link-accent text-sm no-underline hover:underline sm:text-right"
          >
            {next.title} →
          </Link>
        )}
      </nav>
    </div>
  );
}
