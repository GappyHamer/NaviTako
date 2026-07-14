import { ImageResponse } from "next/og";
import { loadNotoSansKR } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "롱숏 예언, 재미로 보는 비트코인 롱/숏";

export default async function OgImage() {
  const title = "타코쨩";
  const tagline = "재미로 보는 비트코인 롱/숏 예언";
  const sub = "예언가 문어 Tako가 오늘의 방향을 찍어드려요";
  const font = await loadNotoSansKR(title + tagline + sub);

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
            "radial-gradient(900px 500px at 50% 0%, #2a1a0b 0%, #0b0f1a 62%)",
          fontFamily: font ? "NotoSansKR" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderBottom: "52px solid #34d399",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 118,
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            {font ? title : "LONG / SHORT"}
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderTop: "52px solid #f87171",
            }}
          />
        </div>

        <div style={{ display: "flex", fontSize: 38, color: "#fdba74" }}>
          {font ? tagline : "Bitcoin Long/Short, just for fun"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#94a3b8",
            marginTop: 16,
          }}
        >
          {font ? sub : "ttakochan.com"}
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
