import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "롱숏 예언의 개인정보처리방침입니다. 수집하는 정보, 쿠키(Google Analytics·Google AdSense) 사용, 이용자의 선택권을 안내해요.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="txt-strong text-2xl font-bold">개인정보처리방침</h1>
        <p className="txt-faint text-xs">시행일: 2026년 7월 6일</p>
      </header>

      <section className="txt space-y-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">1. 개요</h2>
          <p>
            {SITE_NAME}(이하 &ldquo;사이트&rdquo;)은 이용자의 개인정보를 소중하게
            생각합니다. 이 방침은 사이트가 어떤 정보를 수집하고 어떻게 사용하는지
            설명해요. 사이트는 회원가입과 로그인 기능이 없으며, 이름·이메일·전화번호
            같은 개인 식별 정보를 직접 수집하지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            2. 자동으로 수집될 수 있는 정보
          </h2>
          <p>
            사이트는 Vercel 플랫폼에서 호스팅됩니다. 서비스 운영 과정에서 접속
            기록(IP 주소, 브라우저 종류, 접속 일시 등)이 호스팅 사업자의 표준
            로그로 일시 처리될 수 있어요. 이는 서비스 제공과 보안을 위한 것으로,
            사이트 운영자가 개인을 식별하는 데 사용하지 않습니다.
          </p>
          <p>
            또한 서비스는 재미 요소를 위해 예언 결과의 롱/숏 집계 횟수와 예언
            시점의 공개 시세를 익명 통계로 저장합니다. 이 데이터는 특정 개인과
            연결되지 않으며, 오늘의 예언 분포와 적중률을 보여주는 데만 쓰여요.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">3. 쿠키 및 유사 기술</h2>
          <p>
            사이트는 서비스 품질 개선과 광고 게재를 위해 아래 제3자 서비스를
            사용하거나 사용할 예정이며, 이 과정에서 쿠키가 쓰일 수 있습니다.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Google Analytics</strong>: 방문자 수와 페이지 이용 통계 등
              익명화된 사용 데이터를 수집해 서비스 개선에 활용할 수 있습니다.
            </li>
            <li>
              <strong>Google AdSense</strong>: Google을 포함한 제3자 광고
              사업자는 쿠키를 사용해 이용자의 이전 방문 기록을 바탕으로 광고를
              게재할 수 있습니다. 이 과정에서 맞춤형 광고가 표시될 수 있어요.
            </li>
          </ul>
          <p>
            이용자는{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent"
            >
              Google 광고 설정
            </a>
            에서 맞춤형 광고를 끌 수 있고,{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent"
            >
              aboutads.info
            </a>
            에서 제3자 광고 쿠키를 거부할 수 있습니다. 브라우저 설정으로 쿠키
            저장을 거부하거나 삭제할 수도 있어요. 다만 이 경우 일부 기능 이용에
            제한이 있을 수 있습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            4. 로컬 저장소(localStorage)
          </h2>
          <p>
            사이트는 편의 기능을 위해 브라우저 로컬 저장소에 테마 설정(다크/라이트),
            마지막 예언 결과와 다음 예언까지의 대기 시각, 텔레그램 안내 닫음 여부를
            저장합니다. 이 데이터는 개인을 식별하지 않으며 이용자의 기기에만
            저장되고 서버로 전송되지 않아요. 브라우저 데이터를 지우면 함께
            삭제됩니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">
            5. 개인정보의 제3자 제공
          </h2>
          <p>
            사이트는 이용자의 개인정보를 직접 수집하거나 보관하지 않으므로
            제3자에게 판매하거나 제공하지 않습니다. 위 3항의 제3자 서비스(Google)는
            각자의 개인정보처리방침에 따라 데이터를 처리해요.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">6. 아동의 개인정보</h2>
          <p>
            사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를
            고의로 수집하지 않습니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">7. 방침의 변경</h2>
          <p>
            이 방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 이
            페이지에 게시합니다.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="txt-strong text-lg font-semibold">8. 문의</h2>
          <p>
            개인정보 관련 문의:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link-accent">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
