/**
 * 가이드 글(markdown) 로더 — 서버 전용.
 * content/guide/{locale}/*.md 를 읽어 frontmatter를 파싱하고 marked로 HTML 렌더링한다.
 * 언어별 글이 없으면 기본 언어(ko)로 폴백한다. slug 목록은 항상 ko 기준.
 * 광고 중단(中段) 삽입을 위해 본문 중간의 H2 경계에서 두 조각으로 나눈다.
 */

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

marked.setOptions({ gfm: true });

const GUIDE_DIR = path.join(process.cwd(), "content", "guide");
const DEFAULT_LOCALE = "ko";

/** 해당 locale 의 글 경로를 반환하되, 없으면 ko 폴백 경로로. 둘 다 없으면 null */
function resolveGuidePath(slug: string, locale: string): string | null {
  const localized = path.join(GUIDE_DIR, locale, `${slug}.md`);
  if (fs.existsSync(localized)) return localized;
  const fallback = path.join(GUIDE_DIR, DEFAULT_LOCALE, `${slug}.md`);
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

export type GuideArticle = GuideMeta & {
  /** 본문 HTML — 중간 광고 삽입 지점 기준으로 1~2조각 */
  htmlParts: string[];
};

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

/** 본문 중간에 가장 가까운 H2 경계에서 분할 (없으면 통짜 1조각) */
function splitAtMiddleHeading(markdown: string): [string] | [string, string] {
  const headingPattern = /^## .+$/gm;
  const positions: number[] = [];
  for (const m of markdown.matchAll(headingPattern)) {
    if (m.index !== undefined && m.index > 0) positions.push(m.index);
  }
  if (positions.length === 0) return [markdown];

  const middle = markdown.length / 2;
  const best = positions.reduce((a, b) =>
    Math.abs(a - middle) < Math.abs(b - middle) ? a : b
  );
  return [markdown.slice(0, best), markdown.slice(best)];
}

/** slug 목록은 항상 기본 언어(ko) 기준 */
export function getGuideSlugs(): string[] {
  const koDir = path.join(GUIDE_DIR, DEFAULT_LOCALE);
  if (!fs.existsSync(koDir)) return [];
  return fs
    .readdirSync(koDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllGuideMeta(locale: string = DEFAULT_LOCALE): GuideMeta[] {
  return getGuideSlugs()
    .map((slug) => {
      const filePath = resolveGuidePath(slug, locale);
      const raw = filePath ? fs.readFileSync(filePath, "utf8") : "";
      const { data } = parseFrontmatter(raw);
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        order: Number(data.order ?? 999),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getGuideArticle(
  slug: string,
  locale: string = DEFAULT_LOCALE
): GuideArticle | null {
  const filePath = resolveGuidePath(slug, locale);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const parts = splitAtMiddleHeading(body.trim());
  const htmlParts = parts.map((part) => marked.parse(part) as string);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: Number(data.order ?? 999),
    htmlParts,
  };
}
