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
import AdSlot from "@/components/AdSlot";

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
/** 예언 쿨다운 24시간 */
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const LS_RESULT = "tako:lastResult";
const LS_UNTIL = "tako:cooldownUntil";

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

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}시간 ${m}분 ${s}초`;
}

export default function OracleClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(0);
  const [adOpen, setAdOpen] = useState(false);
  const timersRef = useRef<{ interval?: ReturnType<typeof setInterval> }>({});
  const mountedRef = useRef(true);

  // 마운트 시 이전 결과·쿨다운 복원 (없으면 idle 유지 → SSR과 일치)
  useEffect(() => {
    mountedRef.current = true;
    try {
      const raw = localStorage.getItem(LS_RESULT);
      const until = Number(localStorage.getItem(LS_UNTIL));
      if (raw) {
        setResult(JSON.parse(raw) as OracleResult);
        setPhase("revealed");
      }
      if (Number.isFinite(until) && until > Date.now()) {
        setCooldownUntil(until);
        setNowTs(Date.now());
      }
    } catch {
      // 저장소 접근 불가 → 그냥 새로 뽑을 수 있는 상태로 시작
    }
    return () => {
      mountedRef.current = false;
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
    };
  }, []);

  // 쿨다운 카운트다운 1초 틱
  useEffect(() => {
    if (cooldownUntil === null) return;
    const tick = () => setNowTs(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const remaining =
    cooldownUntil !== null ? cooldownUntil - nowTs : 0;
  const locked = cooldownUntil !== null && remaining > 0;

  const summon = useCallback(
    async (viaAd = false) => {
      if (phase === "summoning") return;
      if (!viaAd && cooldownUntil !== null && cooldownUntil > Date.now()) return;

      setPhase("summoning");
      setCopied(false);
      setMessageIndex(0);

      const startedAt = Date.now();
      timersRef.current.interval = setInterval(
        () => setMessageIndex((i) => i + 1),
        MESSAGE_INTERVAL_MS
      );

      const { indicators, allFailed } = await fetchIndicators();

      const wait = Math.max(0, SUMMON_MS - (Date.now() - startedAt));
      await new Promise((resolve) => setTimeout(resolve, wait));
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
      if (!mountedRef.current) return;

      const reading = computeReading(indicators);
      const side = drawOracle(reading.pLong);
      const pool = side === "LONG" ? LONG_MENTS : SHORT_MENTS;
      const ment = pool[Math.floor(Math.random() * pool.length)];
      const res: OracleResult = {
        side,
        ment,
        label: currentLabel(reading.S),
        luckMode: allFailed || reading.luckMode,
      };
      const until = Date.now() + COOLDOWN_MS;

      // Phase 2: 예언 분포·적중률 집계에 기록 (실패해도 UI에는 영향 없음)
      void fetch("/api/stats/record", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ side }),
      }).catch(() => {});

      setResult(res);
      setCooldownUntil(until);
      setNowTs(Date.now());
      try {
        localStorage.setItem(LS_RESULT, JSON.stringify(res));
        localStorage.setItem(LS_UNTIL, String(until));
      } catch {
        // 저장 실패해도 화면 표시는 정상 동작
      }
      setPhase("revealed");
    },
    [phase, cooldownUntil]
  );

  const onAdDone = useCallback(() => {
    setAdOpen(false);
    void summon(true);
  }, [summon]);

  const share = useCallback(async () => {
    if (!result) return;
    const url = `${location.origin}/result/${result.side.toLowerCase()}`;
    const text = `🐙 예언가 Tako의 오늘 예언: ${result.side}! ${result.ment}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "롱숏 예언", text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 불가 환경 → 무시
    }
  }, [result]);

  return (
    <section
      className="flex flex-col items-center gap-8 py-8"
      aria-live="polite"
    >
      {phase !== "revealed" && (
        <>
          <div
            className={`octo select-none text-[7rem] leading-none sm:text-[9rem] ${
              phase === "summoning" ? "animate-octo-shake" : "animate-octo-bob"
            }`}
            role="img"
            aria-label="예언가 문어 Tako"
          >
            🐙
          </div>

          {phase === "idle" && (
            <>
              <p className="txt-muted max-w-md text-center text-sm leading-relaxed">
                전설의 예언가 Tako가 실시간으로 시장을 읽고 롱숏, 단 하나의
                예언을 내려줍니다.
              </p>
              <button
                type="button"
                onClick={() => void summon()}
                className="btn-accent animate-glow-pulse rounded-2xl px-12 py-5 text-xl font-bold shadow-[0_0_40px_rgba(139,92,246,0.45)] transition-transform active:scale-95"
              >
                🔮 예언 받기
              </button>
            </>
          )}

          {phase === "summoning" && (
            <p
              key={messageIndex}
              className="txt-accent animate-fade-up min-h-6 text-center text-base font-medium"
            >
              {LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length]}
            </p>
          )}
        </>
      )}

      {phase === "revealed" && result && (
        <div className="flex w-full max-w-sm flex-col items-center gap-5">
          <div className="flip-scene w-full">
            <div className="flip-inner">
              {/* 앞면: 카드 뒷면 (플립되며 사라짐) */}
              <div className="flip-face surface-solid border-app flex min-h-[360px] flex-col items-center justify-center rounded-3xl border p-8">
                <span className="text-6xl">🐙</span>
                <span className="txt-accent mt-4 text-sm tracking-[0.3em]">
                  TAKO
                </span>
              </div>

              {/* 뒷면: 결과 */}
              <div
                className={`flip-back flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border p-8 ${
                  result.side === "LONG"
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-red-500/40 bg-red-500/10"
                }`}
              >
                {result.luckMode && (
                  <span className="surface txt-warn rounded-full px-3 py-1 text-xs font-medium">
                    {LUCK_MODE_BADGE}
                  </span>
                )}
                <p
                  className={`text-6xl font-black tracking-tight ${
                    result.side === "LONG" ? "txt-long" : "txt-short"
                  }`}
                >
                  {result.side}
                </p>
                {!result.luckMode && (
                  <p className="txt-muted text-sm font-medium">
                    오늘의 기류: {result.label}
                  </p>
                )}
                <p className="txt text-center text-sm leading-relaxed">
                  “{result.ment}”
                </p>
                <p className="txt-faint mt-2 text-center text-[11px] leading-relaxed">
                  {DISCLAIMER_CARD}
                </p>
              </div>
            </div>
          </div>

          {/* 카드 밖 액션 영역 (플립 대상 아님) */}
          {locked ? (
            <div className="flex w-full flex-col items-center gap-3">
              <p className="txt-muted text-center text-xs">
                다음 예언까지{" "}
                <span className="txt-strong tabular-nums font-semibold">
                  {formatRemaining(remaining)}
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdOpen(true)}
                  className="btn-accent rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
                >
                  ⚡ 지금 바로 받기
                </button>
                <button
                  type="button"
                  onClick={share}
                  className="surface txt rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
                >
                  {copied ? "✅ 복사됨!" : "📤 결과 공유"}
                </button>
              </div>
              <p className="txt-faint text-center text-[10px]">
                하루 한 번의 예언이 원칙이에요. 더 궁금하면 광고를 보고 바로 받을
                수 있어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void summon()}
                className="surface txt rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
              >
                🔁 다시 예언 받기
              </button>
              <button
                type="button"
                onClick={share}
                className="btn-accent rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
              >
                {copied ? "✅ 복사됨!" : "📤 결과 공유"}
              </button>
            </div>
          )}
        </div>
      )}

      {adOpen && <AdGateModal onClose={() => setAdOpen(false)} onDone={onAdDone} />}
    </section>
  );
}

/** 광고 게이트 모달 — 쿨다운 중 '지금 바로 받기'로 진입.
 *  실제 리워드 광고 연동 전까지는 placeholder를 보여주고,
 *  짧은 대기 후 즉시 재예언을 허용한다. (신탁 버튼 상시 슬롯 아님) */
function AdGateModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(3);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const ready = left <= 0;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="광고 보고 예언 받기"
      onClick={onClose}
    >
      <div
        className="surface w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="txt-strong text-sm font-bold">⚡ 광고 보고 바로 받기</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="txt-faint hover:opacity-70"
          >
            ✕
          </button>
        </div>
        <p className="txt-muted mt-2 text-xs leading-relaxed">
          짧은 광고를 보면 24시간을 기다리지 않고 지금 바로 예언을 받을 수
          있어요.
        </p>

        {/* 리워드 광고 자리 (승인 후 실제 광고로 교체) */}
        <AdSlot slot="reward-interstitial" height={180} className="mt-4" />

        <button
          type="button"
          disabled={!ready}
          onClick={onDone}
          className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-transform active:scale-95 ${
            ready ? "btn-accent" : "surface txt-faint cursor-not-allowed"
          }`}
        >
          {ready ? "🔮 지금 예언 받기" : `${left}초 후 받을 수 있어요`}
        </button>
      </div>
    </div>
  );
}
