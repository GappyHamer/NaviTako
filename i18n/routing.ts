import { defineRouting } from "next-intl/routing";

/** 지원 로케일 (11개). ko 가 기본이며 prefix 없음(기존 URL 유지),
 *  나머지는 /{locale} 접두사. */
export const routing = defineRouting({
  locales: [
    "ko",
    "en",
    "ja",
    "ru",
    "uk",
    "vi",
    "hi",
    "tr",
    "pt",
    "id",
    "es",
  ],
  defaultLocale: "ko",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
