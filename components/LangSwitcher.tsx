"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** 스위처에 보여줄 언어별 표시명 + 국기 이모지 (하드코딩) */
const LANGS: { code: (typeof routing.locales)[number]; name: string; flag: string }[] = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LangSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const select = (code: (typeof routing.locales)[number]) => {
    setOpen(false);
    if (code === locale) return;
    // 같은 경로를 선택한 언어로 전환 (locale prefix 자동 처리)
    router.replace(pathname, { locale: code });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-app surface txt-muted flex h-9 items-center gap-1 rounded-full border px-2.5 text-sm transition-colors hover:opacity-80"
      >
        <span aria-hidden>🌐</span>
        <span className="hidden text-xs font-semibold uppercase sm:inline">
          {current.code}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="app-header border-app absolute right-0 z-50 mt-2 max-h-80 w-44 overflow-auto rounded-xl border py-1 shadow-xl"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === locale}
                onClick={() => select(l.code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:opacity-80 ${
                  l.code === locale ? "txt-accent font-semibold" : "txt-muted"
                }`}
              >
                <span aria-hidden>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
