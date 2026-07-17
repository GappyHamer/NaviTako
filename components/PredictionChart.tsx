"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * 예언 차트 — BTC 최근 48시간 가격 선 위에 Tako가 예언한 시점을 마커로 찍는다.
 *
 * - 가격: /api/price-history (서버가 Binance klines 수집, 클라 직접 호출 금지)
 * - 예언: localStorage `tako:history` = [{ side, at }]
 * - 마커: 롱 = 위쪽 삼각형(▲), 숏 = 아래쪽 삼각형(▼), 위치 y = 그 시점 근처 가격
 * - 적중 판정(클라): 예언 시점 가격 대비 "최신 가격" 방향이 맞으면 적중
 *     → 적중 = var(--long)(초록), 빗나감 = var(--short)(빨강)
 *
 * 색은 시맨틱 변수만, 애니메이션은 opacity 페이드만(prefers-reduced-motion 존중).
 */

type PricePoint = { t: number; c: number };
type Prediction = { side: "LONG" | "SHORT"; at: number };

const LS_HISTORY = "tako:history";

// SVG 좌표계 (반응형 — width:100% + viewBox)
const W = 640;
const H = 220;
const PAD_L = 10;
const PAD_R = 10;
const PAD_T = 22;
const PAD_B = 22;
const MARKER = 6; // 삼각형 반경(px, viewBox 단위)

function readHistory(): Prediction[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Prediction =>
        !!p &&
        typeof (p as Prediction).at === "number" &&
        ((p as Prediction).side === "LONG" || (p as Prediction).side === "SHORT")
    );
  } catch {
    return [];
  }
}

/** Catmull-Rom → cubic bezier 로 부드러운 path 생성 */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function PredictionChart() {
  const t = useTranslations("oracle");
  const [prices, setPrices] = useState<PricePoint[] | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [shown, setShown] = useState(false);

  const loadHistory = useCallback(() => setHistory(readHistory()), []);

  // 가격 히스토리 fetch (마운트 1회)
  useEffect(() => {
    let alive = true;
    fetch("/api/price-history", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown) => {
        if (!alive) return;
        setPrices(Array.isArray(d) ? (d as PricePoint[]) : []);
      })
      .catch(() => {
        if (alive) setPrices([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 예언 이력 로드 + 갱신 이벤트 구독
  useEffect(() => {
    loadHistory();
    const onUpdate = () => loadHistory();
    window.addEventListener("tako:prediction", onUpdate);
    window.addEventListener("storage", onUpdate);
    // 페이드 인 (opacity only)
    const id = requestAnimationFrame(() => setShown(true));
    return () => {
      window.removeEventListener("tako:prediction", onUpdate);
      window.removeEventListener("storage", onUpdate);
      cancelAnimationFrame(id);
    };
  }, [loadHistory]);

  const model = useMemo(() => {
    if (!prices || prices.length < 2) return null;
    const pts = [...prices].sort((a, b) => a.t - b.t);
    const tMin = pts[0].t;
    const tMax = Math.max(pts[pts.length - 1].t, Date.now());
    const tRange = Math.max(1, tMax - tMin);
    const closes = pts.map((p) => p.c);
    let pMin = Math.min(...closes);
    let pMax = Math.max(...closes);
    const span = pMax - pMin || Math.abs(pMax) || 1;
    pMin -= span * 0.08; // y 패딩
    pMax += span * 0.08;
    const pRange = pMax - pMin || 1;
    const latest = pts[pts.length - 1].c;

    const x = (tt: number) =>
      PAD_L + ((tt - tMin) / tRange) * (W - PAD_L - PAD_R);
    const y = (price: number) =>
      PAD_T + (1 - (price - pMin) / pRange) * (H - PAD_T - PAD_B);

    const linePts = pts.map((p) => ({ x: x(p.t), y: y(p.c) }));
    const linePath = smoothPath(linePts);
    const areaPath =
      linePath +
      ` L ${linePts[linePts.length - 1].x} ${H - PAD_B}` +
      ` L ${linePts[0].x} ${H - PAD_B} Z`;

    // 최신 가격 대비 방향으로 예언 마커 배치 + 적중 판정
    const markers = history
      .filter((h) => h.at >= tMin && h.at <= tMax)
      .map((h) => {
        // 가장 가까운 kline 찾기 (예언 시점 가격)
        let nearest = pts[0];
        let best = Infinity;
        for (const p of pts) {
          const d = Math.abs(p.t - h.at);
          if (d < best) {
            best = d;
            nearest = p;
          }
        }
        const predPrice = nearest.c;
        const hit =
          h.side === "LONG" ? latest > predPrice : latest < predPrice;
        return {
          at: h.at,
          side: h.side,
          cx: x(h.at),
          cy: y(predPrice),
          hit,
        };
      })
      .sort((a, b) => a.at - b.at);

    const hits = markers.filter((m) => m.hit).length;
    return { linePath, areaPath, markers, hits, last: linePts[linePts.length - 1] };
  }, [prices, history]);

  const hasHistory = history.length > 0;
  const markers = model?.markers ?? [];
  const inRange = markers.length;
  const hits = model?.hits ?? 0;

  return (
    <section
      className="mt-2 w-full"
      aria-label={t("chart.sectionAria")}
      style={{
        opacity: shown ? 1 : 0,
        transition: "opacity 400ms ease",
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <p className="txt-muted text-center text-xs">🐙 {t("chart.title")}</p>
        <p className="txt-faint text-center text-[11px] leading-relaxed">
          {t("chart.subtitle")}
        </p>
      </div>

      {/* 요약 */}
      {hasHistory && inRange > 0 && (
        <p className="txt-strong mt-2 text-center text-sm font-semibold tabular-nums">
          {t("chart.summary", { n: inRange, m: hits })}
        </p>
      )}

      {/* 본문 */}
      {prices === null ? (
        <p className="txt-faint mt-3 text-center text-xs">
          {t("chart.loading")}
        </p>
      ) : !model ? (
        <p className="txt-faint mt-3 text-center text-xs">
          {t("chart.noPrice")}
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label={
              hasHistory && inRange > 0
                ? t("chart.summary", { n: inRange, m: hits })
                : t("chart.title")
            }
            className="mt-2 block h-auto w-full overflow-visible"
          >
            <defs>
              <linearGradient id="tako-area" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity="0.18"
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* 면적 + 가격 선 */}
            <path d={model.areaPath} fill="url(#tako-area)" stroke="none" />
            <path
              d={model.linePath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* 최신 가격 점 */}
            <circle
              cx={model.last.x}
              cy={model.last.y}
              r={3.5}
              fill="var(--accent)"
              stroke="var(--bg, transparent)"
              strokeWidth={1}
            />

            {/* 예언 마커 */}
            {markers.map((m, i) => {
              const color = m.hit ? "var(--long)" : "var(--short)";
              const s = MARKER;
              const tri =
                m.side === "LONG"
                  ? `${m.cx},${m.cy - s} ${m.cx - s},${m.cy + s} ${m.cx + s},${m.cy + s}`
                  : `${m.cx},${m.cy + s} ${m.cx - s},${m.cy - s} ${m.cx + s},${m.cy - s}`;
              return (
                <polygon
                  key={`${m.at}-${i}`}
                  points={tri}
                  fill={color}
                  stroke="var(--bg, transparent)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* 마커는 없지만 이력은 있을 때 (전부 48h 밖) */}
          {hasHistory && inRange === 0 && (
            <p className="txt-faint mt-1 text-center text-xs">
              {t("chart.emptyInRange")}
            </p>
          )}
          {/* 이력 자체가 없을 때 */}
          {!hasHistory && (
            <p className="txt-faint mt-1 text-center text-xs">
              {t("chart.empty")}
            </p>
          )}

          {/* 범례 */}
          <div className="txt-faint mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
            <span>{t("chart.legendLong")}</span>
            <span>{t("chart.legendShort")}</span>
            <span className="txt-long">{t("chart.legendHit")}</span>
            <span className="txt-short">{t("chart.legendMiss")}</span>
          </div>
        </>
      )}
    </section>
  );
}
