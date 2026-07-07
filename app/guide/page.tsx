import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuideMeta } from "@/lib/guide";

export const metadata: Metadata = {
  title: "가이드, 크립토 지표 교실",
  description:
    "공포탐욕지수, 펀딩비, 롱숏비율부터 레버리지의 수학까지. Tako가 예언에 쓰는 시장 지표를 쉽게 풀어쓴 교육 콘텐츠 모음이에요.",
};

export default function GuidePage() {
  const guides = getAllGuideMeta();

  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">📚 가이드</h1>
        <p className="txt-muted text-sm leading-relaxed">
          Tako가 예언을 내릴 때 읽는 지표들, 그리고 크립토 시장을 이해하는 데
          필요한 기초 개념을 쉬운 말로 정리했어요. 마지막 글에서는 이 사이트의
          예언 알고리즘을 수식까지 전부 공개합니다.
        </p>
      </header>

      <ul className="space-y-3">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <Link
              href={`/guide/${guide.slug}`}
              className="surface block rounded-2xl p-5 transition-opacity hover:opacity-80"
            >
              <div className="flex items-baseline gap-3">
                <span className="txt-accent text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1">
                  <h2 className="txt-strong font-semibold">{guide.title}</h2>
                  <p className="txt-muted text-sm leading-relaxed">
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
