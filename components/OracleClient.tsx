"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeReading,
  currentLabel,
  drawOracle,
  EMPTY_INDICATORS,
  type MarketIndicators,
  type OracleSide,
} from "@/lib/oracle";
import {
  LOADING_MESSAGES,
  LONG_MENTS,
  LUCK_MODE_BADGE,
  SHORT_MENTS,
} from "@/config/ments";
import { DISCLAIMER_CARD } from "@/config/site";

type Phase = "idle" | "summoning" | "revealed";

type OracleResult = {
  side: OracleSide;
  ment: string;
  label: string;
  luckMode: boolean;
};

/** 두근두근 연출 최소 시간 (스펙: 2~3초) */
const SUMMON_MS = 2600;
/** 로딩 문구 교체 주기 */
const MESSAGE_INTERVAL_MS = 800;

async function fetchIndicators(): Promise<{
  indicators: MarketIndicators;
  allFailed: boolean;
}> {
  try {
    const res = await fetch("/api/market", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      indicators: MarketIndicators;
      allFailed: boolean;
    };
    return { indicators: data.indicators, allFailed: data.allFailed };
  } catch {
    // API 자체가 죽어도 버튼은 항상 동작해야 한다 → 운빨 모드
    return { indicators: EMPTY_INDICATORS, allFailed: true };
  }
}

export default function OracleClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [copied, setCopied] = useState(false);
  const timersRef = useRef<{ interval?: ReturnType<typeof setInterval> }>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
    };
  }, []);

  const summon = useCallback(async () => {
    if (phase === "summoning") return;
    setPhase("summoning");
    setResult(null);
    setCopied(false);
    setMessageIndex(0);

    const startedAt = Date.now();
    timersRef.current.interval = setInterval(
      () => setMessageIndex((i) => i + 1),
      MESSAGE_INTERVAL_MS
    );

    const { indicators, allFailed } = await fetchIndicators();

    // 최소 연출 시간 보장
    const remaining = Math.max(0, SUMMON_MS - (Date.now() - startedAt));
    await new Promise((resolve) => setTimeout(resolve, remaining));
    if (timersRef.current.interval) clearInterval(timersRef.current.interval);
    if (!mountedRef.current) return;

    const reading = computeReading(indicators);
    const side = drawOracle(reading.pLong);
    const pool = side === "LONG" ? LONG_MENTS : SHORT_MENTS;
    const ment = pool[Math.floor(Math.random() * pool.length)];

    setResult({
      side,
      ment,
      label: currentLabel(reading.S),
      luckMode: allFailed || reading.luckMode,
    });
    setPhase("revealed");
  }, [phase]);

  const share = useCallback(async () => {
    if (!result) return;
    const url = `${location.origin}/result/${result.side.toLowerCase()}`;
    const text = `🐙 오늘 문어의 신탁: ${result.side}! — ${result.ment}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "롱숏 신탁", text, url });
        return;
      } catch {
        // 사용자가 공유 시트를 닫은 경우 → 폴백 없이 조용히 종료
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 불가 환경 — 무시
    }
  }, [result]);

  return (
    <section className="flex flex-col items-center gap-8 py-10" aria-live="polite">
      {phase !== "revealed" && (
        <>
          {/* 문어 캐릭터: 이모지 + CSS 애니메이션 (이미지 에셋으로 교체 가능) */}
          <div
            className={`select-none text-[7rem] leading-none sm:text-[9rem] ${
              phase === "summoning" ? "animate-octo-shake" : "animate-octo-bob"
            }`}
            role="img"
            aria-label="점쟁이 문어"
          >
            🐙
          </div>

          {phase === "idle" && (
            <>
              <p className="text-center text-sm text-slate-400">
                심해의 점쟁이 문어가 오늘의 기류를 읽고
                <br />
                롱과 숏, 단 하나의 점괘를 내려줍니다.
              </p>
              <button
                type="button"
                onClick={summon}
                className="animate-glow-pulse rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-12 py-5 text-xl font-bold text-white shadow-[0_0_40px_rgba(139,92,246,0.45)] transition-transform active:scale-95"
              >
                🔮 신탁 받기
              </button>
            </>
          )}

          {phase === "summoning" && (
            <p
              key={messageIndex}
              className="animate-fade-up min-h-6 text-center text-base font-medium text-violet-300"
            >
              {LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]}
            </p>
          )}
        </>
      )}

      {phase === "revealed" && result && (
        <div className="flip-scene w-full max-w-sm">
          <div className="flip-inner">
            {/* 앞면: 카드 뒷면 디자인 (플립되며 사라짐) */}
            <div className="flip-face flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-violet-500/30 bg-slate-900 p-8">
              <span className="text-6xl">🐙</span>
              <span className="mt-4 text-sm tracking-[0.3em] text-violet-400">
                ORACLE
              </span>
            </div>

            {/* 뒷면: 결과 */}
            <div
              className={`flip-back flex min-h-[380px] flex-col items-center justify-center gap-4 rounded-3xl border p-8 ${
                result.side === "LONG"
                  ? "border-emerald-500/40 bg-emerald-950/40"
                  : "border-red-500/40 bg-red-950/40"
              }`}
            >
              {result.luckMode && (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-amber-300">
                  {LUCK_MODE_BADGE}
                </span>
              )}
              <p
                className={`text-6xl font-black tracking-tight ${
                  result.side === "LONG" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {result.side}
              </p>
              {!result.luckMode && (
                <p className="text-sm font-medium text-slate-300">
                  오늘의 기류: {result.label}
                </p>
              )}
              <p className="text-center text-sm leading-relaxed text-slate-200">
                “{result.ment}”
              </p>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                {DISCLAIMER_CARD}
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={summon}
                  className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
                >
                  🔁 다시 뽑기
                </button>
                <button
                  type="button"
                  onClick={share}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
                >
                  {copied ? "✅ 복사됨!" : "📤 결과 공유"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
