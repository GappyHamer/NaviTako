"use client";

import { useEffect, useState } from "react";
import { TELEGRAM_URL } from "@/config/site";

const STORAGE_KEY = "tako:tgClosed";

/** 좌측 하단 소형 텔레그램 홍보 팝업. 닫으면 그 선택을 기억한다.
 *  신탁 버튼과 떨어진 화면 코너에 고정 → 광고 근접 배치 규칙과 무관. */
export default function TelegramPromo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let closed = false;
    try {
      closed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // 접근 불가 환경 → 그냥 보여준다
    }
    if (!closed) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 무시
    }
  };

  if (!open) return null;

  return (
    <aside
      className="animate-fade-up fixed bottom-4 left-4 z-40 w-[15rem] max-w-[calc(100vw-2rem)] rounded-2xl surface p-3.5 shadow-xl backdrop-blur"
      role="complementary"
      aria-label="텔레그램 채널 안내"
    >
      <button
        type="button"
        onClick={close}
        aria-label="닫기"
        className="txt-faint absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-sm hover:opacity-70"
      >
        ✕
      </button>
      <p className="txt-strong text-sm font-bold">🚀 코인 수다방 오픈</p>
      <p className="txt-muted mt-1 text-xs leading-relaxed">
        실시간 시세 잡담과 Tako의 예언 알림을 텔레그램에서 받아보세요.
      </p>
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-accent mt-2.5 block rounded-lg py-1.5 text-center text-xs font-semibold"
      >
        무료로 입장하기 →
      </a>
    </aside>
  );
}
