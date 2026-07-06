# 🚀 배포 가이드 — 왕초보용 단계별 안내

코딩을 몰라도 이 문서만 따라 하면 사이트를 인터넷에 올릴 수 있습니다.
순서대로 진행하세요. 예상 소요 시간: 30분~1시간.

---

## 0단계. 준비물

- **Node.js** — https://nodejs.org 에서 LTS 버전을 설치 (이미 설치되어 있다면 건너뛰기)
- **GitHub 계정** — https://github.com 에서 무료 가입
- **Vercel 계정** — https://vercel.com 에서 "Continue with GitHub"으로 가입 (무료 플랜이면 충분)

---

## 1단계. 내 컴퓨터에서 실행해 보기

1. 이 폴더에서 터미널(명령 프롬프트)을 엽니다.
   - Windows: 폴더 주소창에 `cmd` 라고 치고 Enter
2. 아래 두 줄을 한 줄씩 입력합니다.

   ```
   npm install
   npm run dev
   ```

3. 브라우저에서 http://localhost:3000 을 열면 사이트가 보입니다.
4. 🐙 신탁 버튼을 눌러 동작을 확인하세요.
5. 끝났으면 터미널에서 `Ctrl + C` 로 서버를 끕니다.

> 💡 참고: 내 컴퓨터에서는 바이낸스 API가 정상 호출되지만, 혹시 회사망 등에서
> 차단되어 있어도 "운빨 모드 🎲" 배지가 뜨면서 버튼은 정상 동작합니다. 고장이 아닙니다.

---

## 2단계. GitHub에 코드 올리기

1. https://github.com/new 에서 새 저장소를 만듭니다.
   - Repository name: `longshort-oracle` (아무 이름이나 OK)
   - **Private** 선택 가능 (Vercel은 비공개 저장소도 배포 가능)
   - 다른 옵션은 건드리지 말고 **Create repository** 클릭
2. 이 폴더의 터미널에서 아래를 한 줄씩 입력합니다.
   (`내아이디` 부분은 본인 GitHub 아이디로 바꾸세요)

   ```
   git init
   git add .
   git commit -m "롱숏 신탁 Phase 1"
   git branch -M main
   git remote add origin https://github.com/내아이디/longshort-oracle.git
   git push -u origin main
   ```

3. 로그인 창이 뜨면 GitHub 계정으로 로그인합니다.

---

## 3단계. Vercel로 배포하기 (클릭 몇 번이면 끝)

1. https://vercel.com/new 에 접속합니다.
2. 방금 만든 `longshort-oracle` 저장소 옆의 **Import** 버튼을 클릭합니다.
3. 설정은 **아무것도 바꾸지 말고** 그대로 **Deploy** 클릭.
   - Framework에 "Next.js"가 자동으로 잡혀 있으면 정상입니다.
4. 1~2분 뒤 폭죽이 터지면 배포 완료! 🎉
   `https://longshort-oracle-xxxx.vercel.app` 같은 주소가 생깁니다.

> ⚠️ **리전 확인 (중요)**: 이 프로젝트에는 `vercel.json`에 서울 리전(icn1)이 이미
> 지정되어 있습니다. 바이낸스가 미국 IP를 차단하기 때문인데, 이 파일 덕분에
> 별도 설정 없이 자동으로 서울에서 실행됩니다. **이 파일을 지우면 안 됩니다.**

### 3-1. 사이트 주소 환경변수 넣기 (공유 미리보기·SEO용)

1. Vercel 프로젝트 화면 → **Settings** → **Environment Variables**
2. 아래와 같이 추가하고 Save:
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://본인의-배포-주소.vercel.app` (앞 단계에서 받은 주소, 끝에 `/` 없이)
3. **Deployments** 탭 → 맨 위 배포의 `⋯` 메뉴 → **Redeploy** 를 눌러 한 번 재배포합니다.

이후 코드를 수정하고 `git push`만 하면 Vercel이 자동으로 재배포합니다.

---

## 4단계. 배포 직후 확인 체크리스트

- [ ] 홈에서 신탁 버튼이 동작하고, 결과 카드가 뒤집힌다
- [ ] "운빨 모드" 배지가 **없이** 결과가 나온다 (= 바이낸스 호출 성공, 리전 정상)
- [ ] `/market` 페이지에 지표 수치가 표시된다
- [ ] `/guide` 에 글 10개가 보인다
- [ ] 카카오톡 나에게 보내기로 `내주소/result/long` 을 보내면 초록 LONG 미리보기 이미지가 뜬다

---

## 5단계. 도메인 연결 (선택)

`xxx.vercel.app` 주소 그대로도 운영할 수 있지만, 애드센스 승인에는 **본인 소유 도메인**이 유리합니다.

1. 가비아·후이즈·Cloudflare 등에서 도메인을 구입합니다 (연 1~2만 원대).
2. Vercel 프로젝트 → **Settings** → **Domains** → 구입한 도메인 입력.
3. 화면에 나오는 DNS 레코드(A 또는 CNAME)를 도메인 구입처의 DNS 설정에 그대로 추가합니다.
4. 연결이 끝나면 3-1의 `NEXT_PUBLIC_SITE_URL` 값을 새 도메인으로 바꾸고 Redeploy.

---

## 6단계. 구글 서치콘솔 등록 (검색 노출 시작)

1. https://search.google.com/search-console 접속 → **속성 추가**
2. "URL 접두어" 방식으로 내 사이트 주소를 입력합니다.
3. 소유권 확인은 **DNS 레코드**(도메인 연결한 경우) 또는 **HTML 태그** 방식을 사용합니다.
   - HTML 태그 방식을 쓰려면 `app/layout.tsx`의 `metadata`에 `verification: { google: "받은코드" }` 한 줄을 추가하면 됩니다.
4. 확인이 끝나면 왼쪽 메뉴 **Sitemaps**에서 `sitemap.xml` 을 제출합니다.
   - 예: `https://내주소/sitemap.xml`
5. 색인이 잡히기까지 며칠~몇 주 걸리는 것이 정상입니다.

---

## 7단계. 애드센스 신청 (수익화)

### 신청 시점

바로 신청하지 말고 아래를 채운 뒤 신청하는 것이 승인 확률이 높습니다.

- 사이트를 **2~4주 이상** 운영하며 서치콘솔 색인이 잡힌 상태
- 커뮤니티 공유 등으로 **실제 방문자가 조금이라도** 있는 상태
- 가이드 글이 검색에 노출되기 시작한 상태 (이 사이트는 필수 페이지 4종 + 글 10개가 이미 준비되어 있습니다)

### 신청 절차

1. https://adsense.google.com 에서 가입하고 내 사이트를 등록합니다.
2. 애드센스가 주는 **소유권 확인 코드(메타 태그 또는 스크립트)**를 안내에 따라 사이트에 추가합니다.
3. 심사는 보통 며칠~몇 주 걸립니다. 거절되면 사유를 보완해 재신청하면 됩니다 (여러 번 가능).

### 승인 후 할 일

1. **ads.txt 교체** — `public/ads.txt` 파일을 열어 주석의 안내대로
   본인 게시자 ID(pub-xxxx)로 바꾸고 `git push` 합니다.
2. **광고 코드 삽입** — 애드센스에서 발급받은 광고 단위 코드를
   `components/AdSlot.tsx` 안의 placeholder 부분과 교체합니다.
   광고 자리는 이미 가이드 글 상/중/하, 시장온도 하단에 잡혀 있습니다.
   (⚠️ 신탁 버튼 근처에는 광고를 넣지 않는 것이 이 사이트의 원칙입니다 —
   오클릭 유도로 계정 정지 위험이 있습니다)

---

## 문제 해결

| 증상 | 원인·해결 |
|---|---|
| 배포했더니 항상 "운빨 모드"만 뜬다 | 리전이 미국으로 배포된 것. `vercel.json`이 저장소에 포함되어 있는지 확인 후 재배포 |
| 공유 미리보기 이미지가 안 예쁘다 | 3-1의 `NEXT_PUBLIC_SITE_URL` 설정 후 Redeploy 했는지 확인 |
| `npm install` 에서 에러 | Node.js LTS 버전인지 확인 (`node -v` 로 확인, v20 이상 권장) |
| 빌드 실패 | 터미널에서 `npm run build` 를 돌려 에러 메시지를 확인 |
