/**
 * 가이드 글(markdown) 로더 — 서버 전용.
 * content/guide/*.md 를 읽어 frontmatter를 파싱하고 marked로 HTML 렌더링한다.
 * 광고 중단(中段) 삽입을 위해 본문 중간의 H2 경계에서 두 조각으로 나눈다.
 */

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

marked.setOptions({ gfm: true });

const GUIDE_DIR = path.join(process.cwd(), "content", "guide");

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

export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDE_DIR)) return [];
  return fs
    .readdirSync(GUIDE_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllGuideMeta(): GuideMeta[] {
  return getGuideSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(GUIDE_DIR, `${slug}.md`), "utf8");
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

export function getGuideArticle(slug: string): GuideArticle | null {
  const filePath = path.join(GUIDE_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

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
