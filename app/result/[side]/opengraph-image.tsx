import { ImageResponse } from "next/og";
import { loadNotoSansKR } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "롱숏 신탁 결과";

const KR_TITLE = "롱숏 신탁";
const KR_TAGLINE = "재미로 보는 비트코인 롱/숏 점괘";
const KR_INVITE = "당신의 점괘도 받아보세요";

export default async function OgImage({
  params,
}: {
  params: Promise<{ side: string }>;
}) {
  const { side } = await params;
  const isLong = side === "long";
  const font = await loadNotoSansKR(KR_TITLE + KR_TAGLINE + KR_INVITE);
  const accent = isLong ? "#34d399" : "#f87171";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0f1a 0%, #1a1033 100%)",
          fontFamily: font ? "NotoSansKR" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#a78bfa",
            marginBottom: 12,
            letterSpacing: 4,
          }}
        >
          {font ? KR_TITLE : "LONG/SHORT ORACLE"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* 방향 삼각형 */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "45px solid transparent",
              borderRight: "45px solid transparent",
              ...(isLong
                ? { borderBottom: `78px solid ${accent}` }
                : { borderTop: `78px solid ${accent}` }),
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 190,
              fontWeight: 700,
              color: accent,
              lineHeight: 1,
            }}
          >
            {isLong ? "LONG" : "SHORT"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#cbd5e1",
            marginTop: 28,
          }}
        >
          {font ? KR_INVITE : "Get your own oracle"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#64748b",
            marginTop: 18,
          }}
        >
          {font ? KR_TAGLINE : "For fun only — not financial advice"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "NotoSansKR", data: font, weight: 700 as const }]
        : undefined,
    }
  );
}
