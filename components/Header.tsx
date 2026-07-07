"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS, SITE_NAME } from "@/config/site";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="app-header sticky top-0 z-50 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* 브랜드는 문어 아이콘만 */}
        <Link
          href="/"
          aria-label={SITE_NAME}
          className="text-2xl leading-none transition-transform hover:scale-110 active:scale-95"
        >
          <span aria-hidden>🐙</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="주요 메뉴">
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
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
