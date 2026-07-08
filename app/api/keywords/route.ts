import { NextResponse } from "next/server";
import { SEED_POOLS } from "@/config/keywords";
import { getExtraTargets } from "@/lib/stats";

export const dynamic = "force-dynamic";

/**
 * 키워드 풀 제공. 시드 풀(SEED_POOLS) + 자동 추가된 대상 코인(getExtraTargets)을 합쳐 반환.
 * 클라이언트가 예언 멘트 생성에 쓴다. 저장소가 없어도 시드만으로 정상 응답한다.
 */
export async function GET() {
  const extra = await getExtraTargets();
  const targets = Array.from(new Set([...SEED_POOLS.targets, ...extra]));

  return NextResponse.json(
    {
      subjects: SEED_POOLS.subjects,
      sentimentLong: SEED_POOLS.sentimentLong,
      sentimentShort: SEED_POOLS.sentimentShort,
      targets,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
