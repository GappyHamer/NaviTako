"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { SITE_NAME } from "@/config/site";
import ThemeToggle from "@/components/ThemeToggle";
import LangSwitcher from "@/components/LangSwitcher";

/** 내비 탭 — 라벨은 useTranslations('nav') 로 번역, href 는 그대로. */
const NAV_TABS = [
  { href: "/", key: "home" },
  { href: "/predict", key: "predict" },
  { href: "/market", key: "market" },
  { href: "/guide", key: "guide" },
  { href: "/about", key: "about" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="app-header sticky top-0 z-50 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* 브랜드는 문어 아이콘만 */}
        <Link
          href="/"
          aria-label={SITE_NAME}
          onClick={() => setOpen(false)}
          className="leading-none transition-transform hover:scale-110 active:scale-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/octopus.png"
            alt="타코쨩"
            width={28}
            height={28}
            className="h-7 w-7"
          />
        </Link>

        <div className="flex items-center gap-1.5">
          {/* 데스크톱: 인라인 메뉴 */}
          <nav aria-label="주요 메뉴" className="hidden sm:block">
            <ul className="flex items-center gap-1 text-sm">
              {NAV_TABS.map((tab) => (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={isActive(tab.href) ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 transition-colors ${
                      isActive(tab.href)
                        ? "txt-accent font-semibold"
                        : "txt-muted hover:opacity-80"
                    }`}
                  >
                    {t(tab.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <LangSwitcher />
          <ThemeToggle />

          {/* 모바일: 햄버거 버튼 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            className="border-app surface grid h-9 w-9 place-items-center rounded-full border text-base sm:hidden"
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* 모바일: 펼쳐지는 메뉴 */}
      {open && (
        <nav
          aria-label="모바일 메뉴"
          className="app-header border-app border-t backdrop-blur-xl backdrop-saturate-150 sm:hidden"
        >
          <ul className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3 text-sm">
            {NAV_TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={isActive(tab.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 transition-colors ${
                    isActive(tab.href)
                      ? "txt-accent surface font-semibold"
                      : "txt-muted hover:opacity-80"
                  }`}
                >
                  {t(tab.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
