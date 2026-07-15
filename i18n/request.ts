import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/** 네임스페이스별 메시지 파일 (병렬 작업 충돌 방지). common 은 필수, 나머지는 있으면 병합. */
const NAMESPACES = ["common", "oracle", "pages", "fun"] as const;

type Dict = Record<string, unknown>;

/** 해당 로케일의 네임스페이스 파일들을 합쳐 하나의 메시지 객체로. 없는 파일은 건너뜀. */
async function loadNamespaces(locale: string): Promise<Dict> {
  const out: Dict = {};
  for (const ns of NAMESPACES) {
    try {
      const mod = (await import(`../messages/${locale}/${ns}.json`)).default;
      Object.assign(out, mod);
    } catch {
      // 해당 로케일에 아직 없는 네임스페이스 → 폴백이 채운다
    }
  }
  return out;
}

/** base(ko) 위에 로케일 번역을 얕게→깊게 덮어쓴다. 번역 안 된 키는 base(한국어) 유지. */
function deepMerge(base: Dict, over: Dict): Dict {
  const result: Dict = { ...base };
  for (const key of Object.keys(over)) {
    const b = result[key];
    const o = over[key];
    if (
      b &&
      o &&
      typeof b === "object" &&
      typeof o === "object" &&
      !Array.isArray(b) &&
      !Array.isArray(o)
    ) {
      result[key] = deepMerge(b as Dict, o as Dict);
    } else {
      result[key] = o;
    }
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // ko(기본 로케일)를 모든 키의 폴백 베이스로 두고, 요청 로케일 번역을 덮어쓴다.
  const base = await loadNamespaces(routing.defaultLocale);
  const messages =
    locale === routing.defaultLocale
      ? base
      : deepMerge(base, await loadNamespaces(locale));

  return { locale, messages };
});
