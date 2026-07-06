import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// 합리적 CSP: Next.js 하이드레이션 인라인 스크립트를 위해 'unsafe-inline' 허용,
// 개발 모드 HMR을 위해 'unsafe-eval'은 개발에서만 허용.
// 외부 API(Binance 등)는 서버에서만 호출하므로 connect-src는 'self'로 충분.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
