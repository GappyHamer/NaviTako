---
description: 품질 게이트 일괄 실행 — typecheck → test → build. 배포 전 한 번에 확인.
---

CLAUDE.md의 품질 기준은 **무경고 빌드 통과**다. 아래를 순서대로 실행하고, 실패하면 그 지점에서 멈춰 원인을 보고하라.

1. `npm run typecheck`
2. `npm test`
3. `npm run build`

각 단계의 통과/실패를 간결한 요약(단계별 ✅/❌ + 실패 시 핵심 로그)으로 보고하라. 세 단계 모두 통과하면 "배포 준비 완료"로 마무리한다.
