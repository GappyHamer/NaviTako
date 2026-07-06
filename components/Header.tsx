"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS, SITE_NAME } from "@/config/site";

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0b0f1a]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-base font-bold text-slate-100"
        >
          <span aria-hidden>🐙</span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-1 text-sm">
            {NAV_TABS.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={isActive(tab.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    isActive(tab.href)
                      ? "bg-violet-500/20 font-semibold text-violet-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
