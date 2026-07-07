# 📊 Phase 2 연결 가이드 (예언 분포 + 적중률)

Phase 2 코드는 이미 들어가 있습니다. 무료 **Upstash Redis** 저장소만 연결하면
"오늘의 예언 분포"와 "실제 적중률"이 진짜 데이터로 채워집니다.
연결 전까지는 사이트가 지금처럼 재미용 표시로 자동 폴백하니 조급해할 필요 없어요.

소요 시간: 약 5분. 코딩 지식 필요 없음. **월 요금 없음**(무료 플랜으로 충분).

---

## 방법 A. Vercel에서 원클릭 연결 (권장)

1. https://vercel.com/dashboard 에서 이 프로젝트(navi-tako)를 엽니다.
2. 상단 탭에서 **Storage** 클릭.
3. **Create Database** 버튼 → 목록에서 **Upstash for Redis** 선택.
4. 플랜은 **Free** 선택, 지역(Region)은 **가까운 곳**(예: Japan / Singapore)으로 두고 생성.
5. 생성 후 **Connect to Project**로 navi-tako 프로젝트에 연결합니다.
   - 이때 필요한 환경변수(`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
     또는 `KV_REST_API_URL`, `KV_REST_API_TOKEN`)가 **자동으로 추가**됩니다.
     둘 중 어떤 이름이 들어와도 코드가 알아서 인식합니다.
6. **Deployments** 탭 → 맨 위 배포의 `⋯` → **Redeploy** 로 한 번 재배포.

끝입니다. 이제 예언을 뽑으면 홈 성적표의 "오늘의 예언 분포"가 채워지고,
적중률은 예언한 지 4시간·24시간이 지나면서 하나씩 집계됩니다.

---

## 방법 B. Upstash에서 직접 만들기 (대안)

1. https://upstash.com 가입 후 **Create Database** → Redis 선택, Free 플랜.
2. 데이터베이스 화면의 **REST API** 섹션에서 아래 두 값을 복사합니다.
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Vercel 프로젝트 → **Settings → Environment Variables** 에 위 두 개를 그대로 추가.
4. **Redeploy**.

---

## 선택: Cron 보호 (권장이지만 필수는 아님)

적중률 정산은 사용자가 성적표를 볼 때마다 자동으로 이뤄지고, Vercel Cron이
**하루 한 번** 백업으로 한 번 더 돌립니다(`vercel.json`에 설정됨). 이 Cron 주소가
외부에 노출돼도 큰 문제는 없지만, 막고 싶으면:

1. Vercel → Settings → Environment Variables 에 `CRON_SECRET` 추가(아무 긴 문자열).
2. Redeploy. 그러면 Vercel Cron만 이 주소를 호출할 수 있게 됩니다.

---

## 동작 확인

- 예언을 2~3번 뽑아 봅니다(광고 버튼으로 쿨다운을 우회하면 여러 번 가능).
- 홈 성적표의 **오늘의 예언 분포** 막대가 채워지면 저장소 연결 성공입니다.
- **적중률**은 예언 시점 가격과 4시간·24시간 뒤 가격을 비교해 집계하므로,
  최소 4시간이 지나야 첫 숫자가 나옵니다. 표본이 12건 미만일 때는 재미용
  수치로 보여주다가, 쌓이면 실제 값으로 바뀝니다.

## 비용

- Upstash Free: 하루 1만 명령, 256MB. 이 사이트 규모에서는 한참 남습니다.
- Vercel Cron(Hobby): 하루 1회. 그래서 평소 갱신은 "볼 때 정산" 방식이 담당합니다.
- 요금이 부과되는 구간에 들어가려면 트래픽이 아주 커져야 하며, 그전에 알림이 옵니다.
