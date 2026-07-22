import type { ReactNode } from "react";

/**
 * 라우트 전환마다 리마운트되는 template — 모든 페이지 이동(탭·가이드 클릭·
 * 본문 내 하이퍼링크)에 입장 애니메이션(.page-enter)을 부여한다.
 * reduced-motion 에서는 globals.css 가드가 페이드만 재생한다.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
