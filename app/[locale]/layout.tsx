import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot, { ADS_ENABLED } from "@/components/AdSlot";
import { routing } from "@/i18n/routing";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_URL,
} from "@/config/site";

/** 검색 결과에 노출할 대표 사이트명 (Google site name / og:site_name) */
const SITE_NAME_SEARCH = "TTAKOCHAN";

// 검색엔진 소유확인 메타태그 (네이버 서치어드바이저 / Bing). Vercel 환경변수가
// 있을 때만 <head>에 삽입된다. NAVER_SITE_VERIFICATION / BING_SITE_VERIFICATION.
const verificationOther: Record<string, string> = {};
if (process.env.NAVER_SITE_VERIFICATION)
  verificationOther["naver-site-verification"] = process.env.NAVER_SITE_VERIFICATION;
if (process.env.BING_SITE_VERIFICATION)
  verificationOther["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;

/** locale 별 대체 URL(hreflang). 기본 ko 는 접두사 없음. */
function localeUrl(locale: string): string {
  return locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`;
}
const languageAlternates: Record<string, string> = Object.fromEntries([
  ...routing.locales.map((locale) => [locale, localeUrl(locale)]),
  ["x-default", SITE_URL],
]);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const metaTitle = t("title");
  const metaDescription = t("description");
  // 브랜드 접미사(하위 페이지 제목용) — ko 는 한글 브랜드, 그 외는 로케일 중립 영문 브랜드
  const brand = locale === routing.defaultLocale ? SITE_NAME : SITE_NAME_EN;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: metaTitle,
      template: `%s | ${brand}`,
    },
    description: metaDescription,
    keywords: [
      "비트코인",
      "롱숏",
      "예언",
      "공포탐욕지수",
      "펀딩비",
      "크립토",
      "재미",
    ],
    alternates: {
      canonical: localeUrl(locale),
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      locale,
      siteName: SITE_NAME_SEARCH,
      title: metaTitle,
      description: metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
    robots: { index: true, follow: true },
    ...(Object.keys(verificationOther).length > 0
      ? { verification: { other: verificationOther } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME_SEARCH,
  alternateName: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko",
};

/** 브랜드/로고 신호 — 검색 결과 프로필(로고)·대표명에 활용 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME_SEARCH,
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/octopus.png`,
};

/** 다크 기본. 사용자가 라이트를 고른 적이 있을 때만 라이트로. 페인트 전 실행 → 깜빡임 없음 */
const themeInit = `(function(){try{var t=localStorage.getItem('tako:theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // 정적 렌더링 활성화
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteJsonLd, organizationJsonLd]),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="mx-auto flex w-full max-w-[1400px] flex-1 justify-center gap-6 px-4">
            {/* 좌측 세로 광고 (넓은 화면에서만, 예언 버튼과 떨어진 가장자리) */}
            {ADS_ENABLED && (
              <aside className="hidden w-40 shrink-0 xl:block">
                <div className="sticky top-20">
                  <AdSlot slot="left-rail" height={600} />
                </div>
              </aside>
            )}

            <main className="w-full max-w-3xl py-8 sm:py-12">{children}</main>

            {/* 우측 세로 광고 */}
            {ADS_ENABLED && (
              <aside className="hidden w-40 shrink-0 xl:block">
                <div className="sticky top-20">
                  <AdSlot slot="right-rail" height={600} />
                </div>
              </aside>
            )}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
