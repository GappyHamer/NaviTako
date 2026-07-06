import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "롱숏 신탁의 개인정보처리방침입니다. 수집하는 정보, 쿠키(Google Analytics·Google AdSense) 사용, 이용자의 선택권을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">개인정보처리방침</h1>
        <p className="text-xs text-slate-500">시행일: 2026년 7월 6일</p>
      </header>

      <section className="space-y-6 text-sm leading-relaxed text-slate-300">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            1. 개요
          </h2>
          <p>
            {SITE_NAME}(이하 &ldquo;사이트&rdquo;)은 이용자의 개인정보를
            소중하게 생각합니다. 본 방침은 사이트가 어떤 정보를 수집하고 어떻게
            사용하는지 설명합니다. 사이트는 회원가입·로그인 기능이 없으며,
            이름·이메일·전화번호 등 개인 식별 정보를 직접 수집하지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            2. 자동으로 수집될 수 있는 정보
          </h2>
          <p>
            사이트는 Vercel 플랫폼에서 호스팅됩니다. 서비스 운영 과정에서 접속
            기록(IP 주소, 브라우저 종류, 접속 일시 등)이 호스팅 사업자의 표준
            로그로 일시 처리될 수 있습니다. 이는 서비스 제공·보안을 위한
            것으로, 사이트 운영자가 개인을 식별하는 데 사용하지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            3. 쿠키 및 유사 기술
          </h2>
          <p>
            사이트는 서비스 품질 개선과 광고 게재를 위해 아래와 같은 제3자
            서비스를 사용하거나 사용할 예정이며, 이 과정에서 쿠키가 사용될 수
            있습니다.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-100">Google Analytics</strong> —
              방문자 수, 페이지 이용 통계 등 익명화된 사용 데이터를 수집해
              서비스 개선에 활용할 수 있습니다.
            </li>
            <li>
              <strong className="text-slate-100">Google AdSense</strong> —
              Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전
              방문 기록을 바탕으로 광고를 게재할 수 있습니다. Google의 광고
              쿠키 사용으로 이용자에게 맞춤형 광고가 표시될 수 있습니다.
            </li>
          </ul>
          <p>
            이용자는{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline underline-offset-2"
            >
              Google 광고 설정
            </a>
            에서 맞춤형 광고를 비활성화할 수 있으며,{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline underline-offset-2"
            >
              aboutads.info
            </a>
            에서 제3자 광고 쿠키 사용을 거부할 수 있습니다. 브라우저 설정을
            통해 쿠키 저장을 거부하거나 삭제할 수도 있습니다. 다만 이 경우 일부
            기능 이용에 제한이 있을 수 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            4. 로컬 저장소(localStorage)
          </h2>
          <p>
            사이트는 현재 localStorage에 개인정보를 저장하지 않습니다. 향후
            테마 설정 등 편의 기능을 위해 브라우저 로컬 저장소를 사용하는 경우,
            해당 데이터는 이용자의 기기에만 저장되며 서버로 전송되지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            5. 개인정보의 제3자 제공
          </h2>
          <p>
            사이트는 이용자의 개인정보를 직접 수집·보관하지 않으므로 제3자에게
            판매하거나 제공하지 않습니다. 위 3항의 제3자 서비스(Google)는 각자의
            개인정보처리방침에 따라 데이터를 처리합니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            6. 아동의 개인정보
          </h2>
          <p>
            사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의
            개인정보를 고의로 수집하지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            7. 방침의 변경
          </h2>
          <p>
            본 방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 이
            페이지에 게시합니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">8. 문의</h2>
          <p>
            개인정보 관련 문의:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-violet-400 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
