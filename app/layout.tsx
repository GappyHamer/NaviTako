import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot, { ADS_ENABLED } from "@/components/AdSlot";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/config/site";

// 검색엔진 소유확인 메타태그 (네이버 서치어드바이저 / Bing). Vercel 환경변수가
// 있을 때만 <head>에 삽입된다. NAVER_SITE_VERIFICATION / BING_SITE_VERIFICATION.
const verificationOther: Record<string, string> = {};
if (process.env.NAVER_SITE_VERIFICATION)
  verificationOther["naver-site-verification"] = process.env.NAVER_SITE_VERIFICATION;
if (process.env.BING_SITE_VERIFICATION)
  verificationOther["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "비트코인",
    "롱숏",
    "예언",
    "공포탐욕지수",
    "펀딩비",
    "크립토",
    "재미",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  ...(Object.keys(verificationOther).length > 0
    ? { verification: { other: verificationOther } }
    : {}),
};

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
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko",
};

/** 다크 기본. 사용자가 라이트를 고른 적이 있을 때만 라이트로. 페인트 전 실행 → 깜빡임 없음 */
const themeInit = `(function(){try{var t=localStorage.getItem('tako:theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
      </body>
    </html>
  );
}
