import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/market";

// 요청 시점에 실행하되, 내부 fetch는 60초 데이터 캐시를 사용한다.
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getMarketData();
  return NextResponse.json(data, {
    headers: {
      // Vercel CDN 캐시: 60초 신선, 이후 5분간 stale 허용
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
