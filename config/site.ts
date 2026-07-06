/** 사이트 전역 상수 — 이름, URL, 네비게이션, 면책 문구(스펙 3.5 원문) */

export const SITE_NAME = "롱숏 신탁";
export const SITE_TITLE = "롱숏 신탁 — 재미로 보는 비트코인 롱/숏 점괘";
export const SITE_DESCRIPTION =
  "점쟁이 문어가 실제 시장 지표로 확률을 기울여 BTC 롱/숏 점괘를 내려주는 오락 사이트. 투자 조언이 아닌 재미용 콘텐츠입니다.";

/** 배포 후 Vercel 환경변수 NEXT_PUBLIC_SITE_URL로 교체 (DEPLOY.md 참조) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://longshort-oracle.vercel.app";

export const CONTACT_EMAIL = "juyongjang98@gmail.com";

export const NAV_TABS = [
  { href: "/", label: "신탁" },
  { href: "/market", label: "시장온도" },
  { href: "/guide", label: "가이드" },
  { href: "/about", label: "소개" },
] as const;

/** 결과 카드 면책 (스펙 원문 그대로) */
export const DISCLAIMER_CARD =
  "이 결과는 오락용 콘텐츠로, 투자 권유·조언이 아닙니다. 모든 투자 판단과 책임은 본인에게 있습니다.";

/** 푸터 면책 (스펙 원문 그대로) */
export const DISCLAIMER_FOOTER =
  "본 사이트는 재미를 위한 오락 서비스이며 어떠한 금융 상품의 매매 권유·투자 자문도 제공하지 않습니다. 선물·레버리지 거래는 원금 전액 손실 위험이 있습니다.";

/** 가이드 글 말미 고정 문구 (스펙 3.4) */
export const DISCLAIMER_GUIDE =
  "본 콘텐츠는 교육·오락 목적이며 투자 조언이 아닙니다.";
