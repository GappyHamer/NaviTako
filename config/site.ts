/** 사이트 전역 상수 — 이름, URL, 네비게이션, 면책 문구(스펙 3.5 원문) */

export const SITE_NAME = "롱숏 예언";
/** 예언가 마스코트 이름 */
export const MASCOT_NAME = "Tako";
export const SITE_TITLE = "롱숏 예언, 재미로 보는 비트코인 롱/숏";
export const SITE_DESCRIPTION =
  "예언가 문어 Tako가 실제 시장 지표로 확률을 기울여 비트코인 롱/숏을 예언하는 오락 사이트입니다. 투자 조언이 아니라 재미로 보는 콘텐츠예요.";

/** 배포 후 Vercel 환경변수 NEXT_PUBLIC_SITE_URL로 교체 (DEPLOY.md 참조) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://navi-tako.vercel.app";

export const CONTACT_EMAIL = "juyongjang98@gmail.com";

/**
 * 암호화폐 텔레그램 홍보 링크.
 * 실제 채널을 만든 뒤 이 한 줄만 본인 초대 링크(https://t.me/xxxx)로 바꾸면 됩니다.
 */
export const TELEGRAM_URL = "https://t.me/+your_channel_invite";

export const NAV_TABS = [
  { href: "/", label: "예언" },
  { href: "/predict", label: "내예언" },
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
