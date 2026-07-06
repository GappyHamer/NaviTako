import { ImageResponse } from "next/og";
import { loadNotoSansKR } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "롱숏 신탁 — 재미로 보는 비트코인 롱/숏 점괘";

const KR_TITLE = "롱숏 신탁";
const KR_TAGLINE = "재미로 보는 비트코인 롱/숏 점괘";

export default async function OgImage() {
  const font = await loadNotoSansKR(KR_TITLE + KR_TAGLINE);

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
            alignItems: "center",
            gap: 40,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "35px solid transparent",
              borderRight: "35px solid transparent",
              borderBottom: "60px solid #34d399",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            {font ? KR_TITLE : "LONG / SHORT"}
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "35px solid transparent",
              borderRight: "35px solid transparent",
              borderTop: "60px solid #f87171",
            }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#a78bfa" }}>
          {font ? KR_TAGLINE : "Bitcoin Long/Short Oracle — for fun only"}
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
