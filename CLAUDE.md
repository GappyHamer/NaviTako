# 롱숏 신탁 (LongShort Oracle)

버튼을 누르면 문어가 BTC 선물 롱/숏 중 하나를 "신탁"으로 내려주는 오락 사이트.
전체 명세는 `01-claude-code-프롬프트.md` 참조 (Phase 1 스펙 고정).

## 기술 스택 (변경 금지)

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- 배포: Vercel 무료 플랜, 리전 **icn1 고정** (Binance API가 미국 IP를 451로 차단)
- DB 없음, 로그인 없음, API 키 필요한 외부 서비스 금지 (Phase 1)

## 명령어

- 개발 서버: `npm run dev`
- 빌드: `npm run build` (무경고 통과가 품질 기준)
- 테스트: `npm test` (vitest — lib/oracle.ts 단위 테스트)
- 타입체크: `npm run typecheck`

## 프로젝트 구조

- `app/` — 페이지·라우트 (홈=신탁, /market, /guide, /about, /privacy, /contact, /disclaimer, /result/[side])
- `lib/oracle.ts` — 신탁 알고리즘 (순수 함수, 스펙 고정 — 수식 임의 변경 금지)
- `config/oracle.config.ts` — 가중치·상수 (알고리즘과 분리)
- `config/ments.ts` — 재미 멘트 풀 (롱/숏 각 20개 이상) + 로딩 문구
- `lib/market.ts` — 외부 지표 5종 수집 (서버 전용, 개별 3초 타임아웃, 60초 캐시)
- `content/guide/*.md` — 가이드 글 10개 (애드센스 심사용, 각 1,800자 이상)

## 절대 규칙 (스펙 7장 금지사항)

- 결과에 수치·목표가·진입가 노출 금지 — 오직 "롱"/"숏" + 재미 멘트
- "시그널·자문·추천 진입" 등 금융 자문 어휘 금지 → "신탁", "점괘" 등 오락 어휘만
- 클라이언트가 외부 API 직접 호출 금지 (반드시 `/api/market` 경유)
- 신탁 버튼 근처 광고 슬롯(`<AdSlot />`) 배치 금지
- 유료 서비스·API 키 필요한 것 도입 금지
- 지표 전부 실패해도 버튼은 항상 동작 (P=0.5 운빨 모드)

## 코딩 컨벤션

- `type` 선호, `enum` 금지 (문자열 리터럴 유니온 사용)
- 애니메이션은 transform/opacity만 사용 (60fps 목표)
- 광고 슬롯은 고정 높이 예약으로 CLS 방지

## Phase 2·3 (사용자가 별도 지시할 때만 구현)

- Phase 2: Upstash Redis 통계 + Vercel Cron 적중률
- Phase 3: Supabase Realtime 익명 채팅
