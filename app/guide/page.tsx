import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuideMeta } from "@/lib/guide";

export const metadata: Metadata = {
  title: "가이드 — 크립토 지표 교실",
  description:
    "공포탐욕지수, 펀딩비, 롱숏비율부터 레버리지의 수학까지 — 문어 점집이 점괘에 쓰는 시장 지표를 쉽게 풀어쓴 교육 콘텐츠 모음입니다.",
};

export default function GuidePage() {
  const guides = getAllGuideMeta();

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">📚 가이드</h1>
        <p className="text-sm leading-relaxed text-slate-400">
          문어가 점괘를 내릴 때 읽는 지표들, 그리고 크립토 시장을 이해하는 데
          필요한 기초 개념을 쉬운 말로 정리했습니다. 마지막 글에서는 이 사이트의
          신탁 알고리즘을 수식까지 전부 공개합니다.
        </p>
      </header>

      <ul className="space-y-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-violet-500/40 hover:bg-slate-900"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-violet-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <h2 className="font-semibold text-slate-100">{guide.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {guide.description}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
