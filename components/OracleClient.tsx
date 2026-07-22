"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  computeReading,
  currentLabel,
  drawOracle,
  EMPTY_INDICATORS,
  type MarketIndicators,
  type OracleSide,
} from "@/lib/oracle";
import { LOADING_MESSAGES } from "@/config/ments";
import {
  makeKeywordPhrase,
  SEED_POOLS,
  type KeywordPools,
} from "@/config/keywords";
import dynamic from "next/dynamic";
import AdSlot from "@/components/AdSlot";
import GooParticles from "@/components/GooParticles";
import GuideArrow from "@/components/GuideArrow";
import { playSound } from "@/lib/sound";

/* framer-motion 을 쓰는 SpotlightText 는 mystery 단계에서만 필요 →
   초기 번들에서 제외하고 진입 시점에 청크 로드(LCP 보호) */
const SpotlightText = dynamic(() => import("@/components/SpotlightText"), {
  ssr: false,
});

/** 미스터리 리빙 플로우 phase 머신 */
type Phase = "idle" | "summoning" | "mystery" | "revealed";

type OracleResult = {
  side: OracleSide;
  ment: string;
  label: string;
  luckMode: boolean;
  at?: number; // 예언한 시각(ms)
};

/** 두근두근 연출 최소 시간 (스펙: 2~3초) */
const SUMMON_MS = 2600;
/** 로딩 문구 교체 주기 */
const MESSAGE_INTERVAL_MS = 800;
/** 첫 예언 쿨다운 30분 — 예언할수록 2배씩(1h·2h·4h…) 늘어난다. */
const BASE_COOLDOWN_MS = 30 * 60 * 1000;
/** '지금 바로 받기'(쿨다운 건너뛰기) 하루 허용 횟수 (자정 초기화) */
const MAX_SKIPS_PER_DAY = 3;
/** KST(UTC+9) 오프셋 */
const KST_OFFSET = 9 * 60 * 60 * 1000;

const LS_RESULT = "tako:lastResult";
const LS_UNTIL = "tako:cooldownUntil";
const LS_DAY = "tako:day"; // 카운트 기준 날짜(KST)
const LS_DRAW = "tako:drawCount"; // 오늘 예언 횟수 → 쿨다운 에스컬레이션
const LS_SKIP = "tako:skipCount"; // 오늘 '지금 바로 받기' 사용 횟수
const LS_HISTORY = "tako:history"; // 예언 이력 (예언 차트용, 최근 30개)
const HISTORY_MAX = 30;

/** 예언 이력 append — { side, at } 를 최근 HISTORY_MAX개만 유지. 저장 후 차트 갱신 이벤트 발생. */
function appendHistory(side: OracleSide, at: number): void {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(parsed)
      ? (parsed as { side: OracleSide; at: number }[])
      : [];
    list.push({ side, at });
    localStorage.setItem(
      LS_HISTORY,
      JSON.stringify(list.slice(-HISTORY_MAX))
    );
  } catch {
    // 저장 실패해도 본 예언 흐름에는 영향 없음
  }
  try {
    window.dispatchEvent(new Event("tako:prediction"));
  } catch {
    // 이벤트 발생 불가 환경 → 무시
  }
}

/** KST 기준 날짜 키 (YYYY-MM-DD) */
function kstDayKey(now: number): string {
  return new Date(now + KST_OFFSET).toISOString().slice(0, 10);
}
/** 다음 KST 자정(ms) — 쿨다운이 하루를 넘기면 이 시각으로 고정 */
function nextKstMidnight(now: number): number {
  const kst = now + KST_OFFSET;
  return (Math.floor(kst / 86400000) + 1) * 86400000 - KST_OFFSET;
}
/** 오늘(KST) 예언 횟수 */
function drawsToday(): number {
  try {
    return localStorage.getItem(LS_DAY) === kstDayKey(Date.now())
      ? Number(localStorage.getItem(LS_DRAW)) || 0
      : 0;
  } catch {
    return 0;
  }
}
/** 오늘(KST) '지금 바로 받기' 사용 횟수 */
function skipsUsedToday(): number {
  try {
    return localStorage.getItem(LS_DAY) === kstDayKey(Date.now())
      ? Number(localStorage.getItem(LS_SKIP)) || 0
      : 0;
  } catch {
    return 0;
  }
}

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

/** 키워드 풀 메시지 형태 (fun 네임스페이스) */
type FunMessages = {
  loading?: string[];
  kwSubjects?: string[];
  kwSentimentLong?: string[];
  kwSentimentShort?: string[];
  kwTargets?: string[];
};

export default function OracleClient() {
  const t = useTranslations("oracle");
  const tDisc = useTranslations("disclaimer");
  const locale = useLocale();
  const fun = (useMessages() as { fun?: FunMessages }).fun ?? {};

  /** 로딩 문구 — 현재 로케일 fun.loading (없으면 ko 기본값) */
  const loadingMessages =
    fun.loading && fun.loading.length > 0 ? fun.loading : LOADING_MESSAGES;

  /** 비-ko 로케일: messages 의 kw* 풀로 키워드 문구 생성 (ko 는 /api/keywords 유지) */
  const localePools: KeywordPools = useMemo(
    () => ({
      subjects: fun.kwSubjects ?? [],
      sentimentLong: fun.kwSentimentLong ?? [],
      sentimentShort: fun.kwSentimentShort ?? [],
      targets: fun.kwTargets ?? [],
    }),
    [fun.kwSubjects, fun.kwSentimentLong, fun.kwSentimentShort, fun.kwTargets]
  );

  /** 남은 쿨다운을 로케일 문구로 포맷 */
  const formatRemaining = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? t("cooldown.hms", { h, m, s })
      : t("cooldown.ms", { m, s });
  };

  const [phase, setPhase] = useState<Phase>("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(0);
  const [adOpen, setAdOpen] = useState(false);
  const [pools, setPools] = useState<KeywordPools>(SEED_POOLS);
  const [drawCount, setDrawCount] = useState(0); // 오늘 예언 횟수 (쿨다운 에스컬레이션)
  const [skipCount, setSkipCount] = useState(0); // 오늘 '지금 바로 받기' 사용 횟수
  const timersRef = useRef<{ interval?: ReturnType<typeof setInterval> }>({});
  const mountedRef = useRef(true);

  // 마운트 시 이전 결과·쿨다운 복원 (없으면 idle 유지 → SSR과 일치)
  useEffect(() => {
    mountedRef.current = true;
    // 미스터리 리빙 플로우 도입: 기존 방문자도 새 흐름을 처음부터 경험하도록
    // 저장된 이전 상태를 1회 마이그레이션(초기화)한다. (복원 로직보다 먼저)
    try {
      if (localStorage.getItem("tako:ver") !== "2") {
        [
          LS_RESULT,
          LS_UNTIL,
          LS_DAY,
          LS_DRAW,
          LS_SKIP,
          LS_HISTORY,
        ].forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("tako:ver", "2");
      }
    } catch {
      // 저장소 접근 불가 → 마이그레이션 생략(그대로 진행)
    }
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
      // 오늘 카운트 복원 (자정 지났으면 리셋)
      const today = kstDayKey(Date.now());
      if (localStorage.getItem(LS_DAY) === today) {
        setDrawCount(Number(localStorage.getItem(LS_DRAW)) || 0);
        setSkipCount(Number(localStorage.getItem(LS_SKIP)) || 0);
      } else {
        localStorage.setItem(LS_DAY, today);
        localStorage.setItem(LS_DRAW, "0");
        localStorage.setItem(LS_SKIP, "0");
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
    const tick = () => {
      const n = Date.now();
      setNowTs(n);
      // 자정 지나면 카운트 초기화 (페이지 열어둔 채 넘어가는 경우)
      try {
        if (localStorage.getItem(LS_DAY) !== kstDayKey(n)) {
          localStorage.setItem(LS_DAY, kstDayKey(n));
          localStorage.setItem(LS_DRAW, "0");
          localStorage.setItem(LS_SKIP, "0");
          setDrawCount(0);
          setSkipCount(0);
        }
      } catch {
        // 저장소 접근 불가 → 무시
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  // 키워드 풀 로드 (마운트 시 1회, 실패해도 SEED_POOLS 유지)
  useEffect(() => {
    let alive = true;
    fetch("/api/keywords", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: KeywordPools | null) => {
        if (alive && d && Array.isArray(d.targets) && d.targets.length) {
          setPools(d);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const remaining =
    cooldownUntil !== null ? cooldownUntil - nowTs : 0;
  const locked = cooldownUntil !== null && remaining > 0;

  const summon = useCallback(
    async (viaAd = false) => {
      if (phase === "summoning") return;
      if (!viaAd && cooldownUntil !== null && cooldownUntil > Date.now()) return;
      // '지금 바로 받기'(viaAd)는 하루 MAX_SKIPS_PER_DAY 회까지만
      if (viaAd && skipsUsedToday() >= MAX_SKIPS_PER_DAY) return;

      playSound("click");
      setPhase("summoning");
      playSound("summon");
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
      // ko 는 /api/keywords(트렌딩 반영) 풀, 그 외 로케일은 messages 의 kw* 풀
      const activePools =
        locale === "ko" && pools.targets.length ? pools : localePools;
      const ment = makeKeywordPhrase(side, activePools);
      const res: OracleResult = {
        side,
        ment,
        label: currentLabel(reading.S),
        luckMode: allFailed || reading.luckMode,
        at: Date.now(),
      };
      // 에스컬레이션 쿨다운 + 카운트 (localStorage 최신값으로 stale 방지)
      const now = Date.now();
      const today = kstDayKey(now);
      const newDraw = drawsToday() + 1;
      const newSkip = viaAd ? skipsUsedToday() + 1 : skipsUsedToday();
      const cdMs = BASE_COOLDOWN_MS * Math.pow(2, newDraw - 1); // 30m·1h·2h·4h…
      const until = Math.min(now + cdMs, nextKstMidnight(now)); // 24h/자정 넘기면 자정 고정

      // Phase 2: 예언 분포·적중률 집계에 기록 (실패해도 UI에는 영향 없음)
      void fetch("/api/stats/record", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ side }),
      }).catch(() => {});

      setResult(res);
      setCooldownUntil(until);
      setNowTs(now);
      setDrawCount(newDraw);
      setSkipCount(newSkip);
      try {
        localStorage.setItem(LS_RESULT, JSON.stringify(res));
        localStorage.setItem(LS_UNTIL, String(until));
        localStorage.setItem(LS_DAY, today);
        localStorage.setItem(LS_DRAW, String(newDraw));
        localStorage.setItem(LS_SKIP, String(newSkip));
      } catch {
        // 저장 실패해도 화면 표시는 정상 동작
      }
      // 예언 차트용 이력 저장 (기존 저장 로직과 독립, 실패해도 무해)
      appendHistory(side, res.at ?? now);
      // 새 플로우: 곧바로 펼치지 않고 미스터리(가려진 스포트라이트) 단계로.
      // 사용자가 카드를 쓸어 확인한 뒤 눌러서 revealed 로 펼친다.
      setPhase("mystery");
      playSound("reveal");
    },
    [phase, cooldownUntil, pools, locale, localePools]
  );

  // 문어 클릭 = 예언. 쿨다운 중이면 광고 게이트 모달을 연다.
  // (idle·summoning·revealed 모든 phase에서 문어는 클릭 가능)
  const onOcto = useCallback(() => {
    if (locked) {
      // 쿨다운 중 → 바로받기 남아 있으면 게이트 열기 (소진 시 무시)
      if (skipCount < MAX_SKIPS_PER_DAY) setAdOpen(true);
    } else void summon();
  }, [locked, skipCount, summon]);

  const onAdDone = useCallback(() => {
    setAdOpen(false);
    void summon(true);
  }, [summon]);

  const share = useCallback(async () => {
    if (!result) return;
    const url = `${location.origin}/result/${result.side.toLowerCase()}?k=${encodeURIComponent(result.ment)}`;
    const text = `🐙 ${t("shareText", { side: result.side, ment: result.ment })}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: t("shareTitle"), text, url });
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
      className="flex flex-col items-center gap-8 pb-8 pt-2"
      aria-live="polite"
    >
      {/* 문어는 항상 위에 고정 — 결과가 떠 있어도 사라지지 않는다.
          클릭하면 예언 소환(접근성용 버튼은 아래에 별도 유지).
          STAGE(transform 없음)를 기준으로 파티클을 문어 흔들림과 독립시킨다. */}
      <div className="relative w-fit">
        {/* 호버 스케일(transform) → grow(transform) → 흔들림/bob(transform) 중첩 */}
        <div
          className="octo-hover relative cursor-pointer select-none"
          role="button"
          aria-label={t("octoAria")}
          tabIndex={0}
          onClick={onOcto}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOcto();
            }
          }}
        >
          <div className={phase === "summoning" ? "octo-grow" : ""}>
            <div
              className={
                phase === "summoning"
                  ? "animate-octo-shake"
                  : "animate-octo-bob"
              }
            >
              <div className="octo-glow octo-glass">
                {/* 메인 이미지 (히어로 전용) — 나머지 문어는 Icon(/octopus.png) 사용 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/octopus-main.png"
                  alt=""
                  width={224}
                  height={224}
                  draggable={false}
                  className="h-40 w-40 select-none sm:h-56 sm:w-56"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 소환 중: 넓은 반지름에서 문어 중심으로 끈적하게 뭉치며 수렴하는
            SVG gooey 파티클. STAGE의 직접 자식(형제)이라 문어 transform
            (흔들림/grow)의 영향을 받지 않는다. */}
        {phase === "summoning" && <GooParticles />}
      </div>

      {phase === "idle" && (
        // 첫인상 미니멀 — 문어만 크게. 은은한 힌트 한 줄이 마운트 1.2s 후 페이드인.
        <p
          className="txt-faint animate-fade-up text-center text-sm"
          style={{ animationDelay: "1.2s" }}
        >
          {t("hint.tapOcto")}
        </p>
      )}

      {phase === "summoning" && (
        // 카드 없음 — 문어(커짐+흔들림)와 문어로 모이는 파티클은 위 히어로에서 연출.
        // 여기서는 로딩 문구만 표시한다.
        <p
          key={messageIndex}
          className="txt-accent animate-fade-up min-h-6 text-center text-base font-medium"
        >
          {loadingMessages[messageIndex % loadingMessages.length]}
        </p>
      )}

      {phase === "mystery" && result && (
        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          {/* 문어 → 카드 유도 화살표 (그려진 뒤 위아래 bob) */}
          <GuideArrow />

          {/* 미스터리 카드 — 오직 가려진 LONG/SHORT 만. 쓸어서 엿보고 눌러 펼친다. */}
          <div
            role="button"
            tabIndex={0}
            aria-label={t("hint.sweepCard")}
            onClick={() => {
              setPhase("revealed");
              playSound("click");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPhase("revealed");
                playSound("click");
              }
            }}
            className="surface-solid border-app reveal-unfold flex min-h-[360px] w-full cursor-pointer items-center justify-center rounded-3xl border p-8"
          >
            <SpotlightText
              text={result.side}
              brightColor={
                result.side === "LONG" ? "var(--long)" : "var(--short)"
              }
              dimColor="color-mix(in srgb, var(--fg-faint) 18%, transparent)"
              maskSize={170}
              className="text-center text-7xl font-black tracking-tight sm:text-8xl"
            />
          </div>

          <p className="txt-faint text-center text-xs">{t("hint.sweepCard")}</p>
        </div>
      )}

      {phase === "revealed" && result && (
        <div className="flex w-full max-w-sm flex-col items-center gap-5">
          {/* 리빙 글로우 아지랑이용 필터 — 같은 문서 내 defs 필요(revealed 때만 렌더).
              glow-flash 가 filter: blur() url(#tako-heat) 로 참조한다. */}
          <svg
            width={0}
            height={0}
            aria-hidden="true"
            style={{ position: "absolute" }}
          >
            <defs>
              <filter id="tako-heat">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.012 0.03"
                  numOctaves={2}
                  result="n"
                />
                <feDisplacementMap in="SourceGraphic" in2="n" scale={14} />
              </filter>
            </defs>
          </svg>

          {/* 리빙 순간: 문어 아래 glow 플래시 → 결과 카드가 펼쳐지며 등장 */}
          <div className="relative w-full">
            {/* 순간 glow 하이라이트 플래시 (문어 바로 아래, 1회) */}
            <span className="glow-flash" aria-hidden="true" />

            {/* 결과 카드 — 펼쳐지며 등장 (unfold) */}
            <div
              className={`reveal-unfold flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border p-8 ${
                result.side === "LONG"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              {result.luckMode && (
                <span className="surface txt-warn rounded-full px-3 py-1 text-xs font-medium">
                  {t("luckBadge")}
                </span>
              )}
              <p
                className={`text-7xl font-black tracking-tight sm:text-8xl ${
                  result.side === "LONG" ? "txt-long" : "txt-short"
                }`}
              >
                {result.side}
              </p>
              <p className="txt-strong text-center text-xl font-bold tracking-wide">
                {result.ment}
              </p>
              <p className="txt-faint mt-2 text-center text-[11px] leading-relaxed">
                {tDisc("card")}
              </p>
              {result.at && (
                <p className="txt-faint text-center text-[11px] tabular-nums">
                  🕐{" "}
                  {new Date(result.at).toLocaleString(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* 카드 밖 액션 영역 (플립 대상 아님) */}
          {locked ? (
            <div className="flex w-full flex-col items-center gap-3">
              <p className="txt-muted text-center text-xs">
                {t("cooldown.until")}{" "}
                <span className="txt-strong tabular-nums font-semibold">
                  {formatRemaining(remaining)}
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {skipCount < MAX_SKIPS_PER_DAY && (
                  <button
                    type="button"
                    onClick={() => setAdOpen(true)}
                    className="btn-accent rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
                  >
                    ⚡ {t("skip.remaining", { n: MAX_SKIPS_PER_DAY - skipCount })}
                  </button>
                )}
                <button
                  type="button"
                  onClick={share}
                  className="surface txt rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
                >
                  {copied ? `✅ ${t("copied")}` : `📤 ${t("share")}`}
                </button>
              </div>
              <p className="txt-faint text-center text-[10px]">
                {skipCount < MAX_SKIPS_PER_DAY
                  ? t("cooldown.help", { n: MAX_SKIPS_PER_DAY })
                  : t("cooldown.exhausted")}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void summon()}
                className="surface txt rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:opacity-80"
              >
                🔁 {t("again")}
              </button>
              <button
                type="button"
                onClick={share}
                className="btn-accent rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95"
              >
                {copied ? `✅ ${t("copied")}` : `📤 ${t("share")}`}
              </button>
            </div>
          )}

          {/* 예언하기 페이지로 유도 (내가 직접 예언 + 리더보드) */}
          <Link
            href="/predict"
            className="border-app surface txt flex w-full items-center justify-center gap-1.5 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:opacity-80"
          >
            🔮 {t("predictSelf")} →
          </Link>
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
  const t = useTranslations("oracle");
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
      aria-label={t("ad.aria")}
      onClick={onClose}
    >
      <div
        className="surface w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="txt-strong text-sm font-bold">⚡ {t("ad.title")}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("ad.close")}
            className="txt-faint hover:opacity-70"
          >
            ✕
          </button>
        </div>
        <p className="txt-muted mt-2 text-xs leading-relaxed">
          {t("ad.desc")}
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
          {ready ? `🔮 ${t("ad.confirm")}` : t("ad.wait", { n: left })}
        </button>
      </div>
    </div>
  );
}
