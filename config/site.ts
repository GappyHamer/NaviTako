/** 사이트 전역 상수 — 이름, URL, 네비게이션, 면책 문구(스펙 3.5 원문) */

export const SITE_NAME = "타코쨩";
/** 영문 브랜드명 (도메인·해외 노출용) */
export const SITE_NAME_EN = "TTakochan";
/** 예언가 마스코트 이름 */
export const MASCOT_NAME = "Tako";
export const SITE_TITLE = "타코쨩(TTakochan), 재미로 보는 비트코인 롱숏 예언";
export const SITE_DESCRIPTION =
  "예언가 문어 타코쨩이 실시간 시장 지표로 비트코인 롱·숏을 예언하는 오락 사이트. 재미로 즐기는 콘텐츠예요.";

/** 배포 후 Vercel 환경변수 NEXT_PUBLIC_SITE_URL로 교체 (DEPLOY.md 참조) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ttakochan.com";

export const CONTACT_EMAIL = "juyongjang98@gmail.com";

/** 암호화폐 텔레그램 홍보 채널 (좌하단 홍보 팝업) */
export const TELEGRAM_URL = "https://t.me/x125lever";

/** 문의용 개인 텔레그램 (문의 페이지 연결) */
export const TELEGRAM_CONTACT = "https://t.me/Gong_ms";

export const NAV_TABS = [
  { href: "/", label: "예언" },
  { href: "/predict", label: "예언하기" },
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

/** 커뮤니티/소셜 계정 (푸터 카드). type: 아이콘 종류, isNew: NEW 뱃지 */
export const SOCIAL_LINKS = [
  { name: "김공수", url: "https://x.com/GongsuKim", type: "x", isNew: true },
  { name: "난 모르겠다 이제", url: "https://t.me/x125lever", type: "telegram", isNew: false },
  { name: "쥬사모", url: "https://t.me/chatjudylee", type: "telegram", isNew: false },
] as const;
