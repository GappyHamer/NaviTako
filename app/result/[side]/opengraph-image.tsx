import { ImageResponse } from "next/og";
import { loadNotoSansKR } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tako의 비트코인 예언 결과";

export default async function OgImage({
  params,
}: {
  params: Promise<{ side: string }>;
}) {
  const { side } = await params;
  const isLong = side === "long";
  const accent = isLong ? "#34d399" : "#f87171";
  const label = "TAKO의 예언";
  const punch = isLong ? "문어가 초록불을 켰다" : "문어가 빨간불을 켰다";
  const cta = "당신의 예언은?";
  const handle = "navi-tako.vercel.app";

  const font = await loadNotoSansKR(label + punch + cta);

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
          background:
            "radial-gradient(900px 500px at 50% 0%, #241452 0%, #0b0f1a 62%)",
          fontFamily: font ? "NotoSansKR" : "sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 브랜드 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 34,
            color: "#fdba74",
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          <span>{font ? label : "TAKO ORACLE"}</span>
        </div>

        {/* 메인 결과 */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "48px solid transparent",
              borderRight: "48px solid transparent",
              ...(isLong
                ? { borderBottom: `84px solid ${accent}` }
                : { borderTop: `84px solid ${accent}` }),
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 200,
              fontWeight: 700,
              color: accent,
              lineHeight: 1,
            }}
          >
            {isLong ? "LONG" : "SHORT"}
          </div>
        </div>

        {/* 밈 한 줄 */}
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            color: "#f8fafc",
            marginTop: 24,
          }}
        >
          {font ? punch : isLong ? "Green light!" : "Red light!"}
        </div>

        {/* 하단 CTA + 핸들 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#94a3b8",
            marginTop: 26,
          }}
        >
          <span>{font ? cta : "Your call?"}</span>
          <span style={{ color: "#5b21b6" }}>◆</span>
          <span style={{ color: "#fdba74" }}>{handle}</span>
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
