"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

/** 다크/라이트 전환 버튼. 선택은 localStorage에 저장되고, 초기 적용은
 *  layout의 인라인 스크립트가 담당한다(깜빡임 방지). */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as Theme | undefined) ?? "dark";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("tako:theme", next);
    } catch {
      // 저장 실패해도 전환 자체는 동작
    }
    setTheme(next);
  };

  // 마운트 전에는 아이콘 확정 불가 → 자리만 예약(레이아웃 이동 방지)
  const label =
    theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border-app border text-base transition-transform active:scale-90 surface"
    >
      <span aria-hidden suppressHydrationWarning>
        {theme === null ? "" : theme === "light" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
