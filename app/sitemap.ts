import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { getGuideSlugs } from "@/lib/guide";
import { routing } from "@/i18n/routing";

/** 경로(path)를 로케일별 절대 URL로. 기본 ko 는 접두사 없음. */
function urlFor(locale: string, path: string): string {
  return locale === routing.defaultLocale
    ? `${SITE_URL}${path}`
    : `${SITE_URL}/${locale}${path}`;
}

/** 각 경로에 대해 hreflang alternates(languages + x-default)를 만든다. */
function alternatesFor(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = urlFor(locale, path);
  languages["x-default"] = urlFor(routing.defaultLocale, path);
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/market", changeFrequency: "hourly", priority: 0.8 },
    { path: "/guide", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.2 },
    { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticEntries.map((e) => ({
    url: urlFor(routing.defaultLocale, e.path),
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    alternates: alternatesFor(e.path),
  }));

  const guidePages: MetadataRoute.Sitemap = getGuideSlugs().map((slug) => ({
    url: urlFor(routing.defaultLocale, `/guide/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: alternatesFor(`/guide/${slug}`),
  }));

  return [...staticPages, ...guidePages];
}
