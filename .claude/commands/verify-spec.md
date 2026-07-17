---
description: 스펙 7장 절대 규칙(금지사항) 위반 여부를 코드에서 감사한다.
---

CLAUDE.md의 **절대 규칙(스펙 7장 금지사항)**을 코드베이스에서 감사하라. Grep으로 증거(`file:line`)를 찾아 규칙별 통과/위반을 표로 보고한다. 판단이 애매하면 위반 후보로 표시하고 근거를 남긴다.

| # | 규칙 | 점검 방법 |
|---|------|-----------|
| 1 | 결과에 수치·목표가·진입가 노출 금지 (오직 "롱"/"숏" + 재미 멘트) | `app/[locale]/result`, `components/OracleClient.tsx`, `lib/oracle.ts`에서 결과 렌더에 숫자/가격이 노출되는지 |
| 2 | 금융 자문 어휘 금지 (신탁·점괘 등 오락 어휘만) | `시그널\|자문\|추천\|진입가\|목표가\|signal\|recommend\|advice` 를 `app/ components/ config/ments messages/` 에서 검색 |
| 3 | 신탁 버튼 근처 AdSlot 배치 금지 | `OracleClient`/홈 히어로 주변에 `<AdSlot` 존재 여부 |
| 4 | 클라이언트가 외부 API 직접 호출 금지 (반드시 /api/market 경유) | `"use client"` 컴포넌트에서 Binance 등 외부 fetch 직접 호출 여부 |
| 5 | 지표 전부 실패해도 버튼 항상 동작 (P=0.5 운빨 모드) | `lib/market.ts`에 전량 실패 시 폴백 경로 존재 여부 |

각 규칙에 대해 **✅ 통과 / ⚠️ 위반 의심 / ❌ 위반**과 `file:line` 근거를 표로 정리하라. 위반이 없으면 "절대 규칙 전부 준수"로 마무리한다.
