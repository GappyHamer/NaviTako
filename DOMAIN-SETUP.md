# 🌐 도메인 연결 가이드 (왕초보용)

## 먼저 궁금증부터

- **호스팅 따로 필요해요?** → **아니요.** Vercel이 호스팅입니다. 카페24 같은 웹호스팅 살 필요 없어요.
- **도메인 연결하면 그 주소로 떠요?** → **네.** DNS 연결이 끝나면 바로 `내도메인.com` 으로 사이트가 열립니다.
- **구글 서치콘솔은 꼭 해야 해요?** → **접속에는 필요 없어요.** 서치콘솔은 "구글 검색 결과에 노출"시키는 용도(선택이지만 권장). 안 해도 링크로 접속은 됩니다.

정리하면: **도메인 연결 = 접속 가능** / **서치콘솔 = 검색 노출**. 별개예요.

---

## 1단계. Vercel에 도메인 연결

1. https://vercel.com/dashboard → navi-tako 프로젝트 → **Settings → Domains**
2. 구매한 도메인(예: `navitako.com`)을 입력하고 **Add**
3. Vercel이 **DNS 레코드**를 알려줍니다. 보통 두 가지 방법 중 하나:
   - **A 레코드**: `@` → `76.76.21.21` (Vercel이 주는 IP)
   - 또는 **CNAME**: `www` → `cname.vercel-dns.com`
   - **www와 루트(@) 둘 다** 안내해주니 그대로 따르면 됩니다.
4. 이 레코드를 **도메인 산 곳**(가비아·후이즈·클라우드플레어·Namecheap 등)의 **DNS 설정**에 그대로 추가합니다.
5. 몇 분~몇 시간 뒤 Vercel Domains 화면에 초록 체크(Valid)가 뜨면 연결 완료. HTTPS 인증서는 Vercel이 자동 발급합니다.

> 클라우드플레어에서 도메인을 샀다면: DNS를 클라우드플레어에서 관리하므로, 위 레코드를 클라우드플레어 DNS에 넣으면 됩니다. (프록시 주황구름은 CNAME의 경우 꺼두는 게 안전)

---

## 2단계. 사이트 주소 환경변수 교체 (중요)

도메인이 바뀌었으니 OG 공유 이미지·sitemap이 새 주소를 쓰도록 바꿔야 해요.

1. Vercel → **Settings → Environment Variables**
2. `NEXT_PUBLIC_SITE_URL` 값을 새 도메인으로 (예: `https://navitako.com`, 끝에 `/` 없이)
3. **Deployments → 맨 위 ⋯ → Redeploy** 로 한 번 재배포

---

## 3단계. (선택) 구글 서치콘솔 등록 = 검색 노출

1. https://search.google.com/search-console → **속성 추가** → "URL 접두어" 에 새 도메인 입력
2. 소유권 확인:
   - **DNS 방식**(권장): 서치콘솔이 준 TXT 레코드를 도메인 DNS에 추가
   - 또는 **HTML 태그**: `app/layout.tsx` 의 metadata 에 `verification: { google: "코드" }` 한 줄 추가 (원하시면 제가 넣어드려요)
3. 확인되면 왼쪽 **Sitemaps** 에서 `sitemap.xml` 제출 (예: `https://navitako.com/sitemap.xml`)
4. 색인까지 며칠~몇 주 걸리는 게 정상입니다.

---

## 4단계. 구글 로그인을 쓴다면 (도메인 바꾼 뒤 꼭)

Google Cloud Console의 OAuth 설정에서 **승인된 리디렉션 URI**를 새 도메인으로 바꿔야 로그인이 됩니다.
- `https://navitako.com/api/auth/callback` 추가 (기존 vercel.app 주소도 남겨두면 둘 다 동작)
- 자세한 건 `GOOGLE-LOGIN-SETUP.md` 참고.

---

## 체크리스트

- [ ] Vercel Domains에 도메인 추가 + DNS 레코드 등록 → Valid(초록)
- [ ] `내도메인.com` 으로 접속 확인
- [ ] `NEXT_PUBLIC_SITE_URL` 새 도메인으로 교체 + Redeploy
- [ ] (선택) 서치콘솔 등록 + sitemap 제출
- [ ] (구글 로그인 쓰면) OAuth 리디렉션 URI에 새 도메인 추가
