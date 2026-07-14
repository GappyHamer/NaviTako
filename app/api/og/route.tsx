import { ImageResponse } from "next/og";
import { loadNotoSansKR } from "@/lib/og-font";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const side = searchParams.get("side") === "short" ? "short" : "long";
  const k = (searchParams.get("k") ?? "").slice(0, 60);

  const isLong = side === "long";
  const accent = isLong ? "#34d399" : "#f87171";
  const label = "TAKO의 예언";
  const punch = isLong ? "문어가 초록불을 켰다" : "문어가 빨간불을 켰다";

  const kws = k
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  // 문어 이미지를 요청 origin에서 fetch → data URI (Vercel에서 public/ fs 접근 회피)
  let octoUri = "";
  try {
    const r = await fetch(`${origin}/octopus-main.png`);
    if (r.ok) {
      octoUri = `data:image/png;base64,${Buffer.from(
        await r.arrayBuffer()
      ).toString("base64")}`;
    }
  } catch {}

  const font = await loadNotoSansKR(label + punch + k + "당신의예언은");

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
          gap: 14,
          background:
            "radial-gradient(900px 500px at 50% 0%, #2a1a0b 0%, #0b0f1a 62%)",
          fontFamily: font ? "NotoSansKR" : "sans-serif",
        }}
      >
        {octoUri ? (
          <img src={octoUri} width={140} height={140} alt="" />
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#fdba74",
            letterSpacing: 4,
          }}
        >
          {font ? label : "TAKO ORACLE"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 210,
            fontWeight: 800,
            color: accent,
            lineHeight: 1,
          }}
        >
          {isLong ? "LONG" : "SHORT"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#f8fafc",
          }}
        >
          {font ? punch : isLong ? "Green light!" : "Red light!"}
        </div>

        {kws.length > 0 ? (
          <div style={{ display: "flex", gap: 12 }}>
            {kws.map((kw, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 9999,
                  background: "rgba(249,115,22,0.18)",
                  border: "2px solid #fb923c",
                  color: "#fed7aa",
                  fontSize: 30,
                }}
              >
                {kw}
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#fdba74",
          }}
        >
          ttakochan.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: font
        ? [{ name: "NotoSansKR", data: font, weight: 700 as const }]
        : undefined,
    }
  );
}
