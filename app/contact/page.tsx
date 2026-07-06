import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "문의",
  description:
    "롱숏 신탁에 대한 제안, 오류 제보, 광고·제휴 문의를 받는 페이지입니다.",
};

export default function ContactPage() {
  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">📮 문의</h1>
        <p className="text-sm leading-relaxed text-slate-400">
          {SITE_NAME}에 대한 의견은 언제나 환영합니다. 아래 이메일로 보내주시면
          확인 후 답변드리겠습니다.
        </p>
      </header>

      <section className="space-y-6 text-sm leading-relaxed text-slate-300">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center">
          <p className="text-xs text-slate-500">이메일</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 inline-block text-lg font-semibold text-violet-400 underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            이런 문의를 받아요
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>사이트 오류·버그 제보 (기기·브라우저 정보를 함께 주시면 큰 도움이 됩니다)</li>
            <li>새 기능·재미 멘트 아이디어 제안</li>
            <li>가이드 콘텐츠의 오류 지적 또는 주제 제안</li>
            <li>광고·제휴 관련 문의</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            답변이 어려운 문의
          </h2>
          <p>
            투자 판단에 대한 질문(&ldquo;지금 롱인가요 숏인가요?&rdquo; 등)에는
            답변드리지 않습니다. {SITE_NAME}은 오락 서비스이며, 자세한 내용은{" "}
            <Link
              href="/disclaimer"
              className="text-violet-400 underline underline-offset-2"
            >
              면책조항
            </Link>
            을 확인해 주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
