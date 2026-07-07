import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "문의",
  description:
    "롱숏 예언에 대한 제안, 오류 제보, 광고·제휴 문의를 받는 페이지예요.",
};

export default function ContactPage() {
  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">📮 문의</h1>
        <p className="txt-muted text-sm leading-relaxed">
          {SITE_NAME}에 대한 의견은 언제나 환영이에요. 아래 이메일로 보내주시면
          확인하고 답변드릴게요.
        </p>
      </header>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="surface rounded-2xl p-6 text-center">
          <p className="txt-faint text-xs">이메일</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="txt-accent mt-1 inline-block text-lg font-semibold underline underline-offset-4"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">이런 문의를 받아요</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              사이트 오류·버그 제보 (기기와 브라우저 정보를 함께 주시면 큰
              도움이 됩니다)
            </li>
            <li>새 기능이나 재미 멘트 아이디어 제안</li>
            <li>가이드 콘텐츠의 오류 지적, 또는 다뤘으면 하는 주제 제안</li>
            <li>광고·제휴 관련 문의</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            답변이 어려운 문의
          </h2>
          <p>
            투자 판단에 대한 질문(&ldquo;지금 롱인가요 숏인가요?&rdquo; 같은)에는
            답변드리지 않아요. {SITE_NAME}은 오락 서비스이며, 자세한 내용은{" "}
            <Link href="/disclaimer" className="link-accent">
              면책조항
            </Link>
            을 확인해 주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
