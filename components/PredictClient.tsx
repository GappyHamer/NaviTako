"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserId, getNick, setNick } from "@/lib/user";

/* ---------- 로컬 타입 (API 계약과 일치) ---------- */

type Side = "LONG" | "SHORT";
type LbSort = "streak" | "acc";

type UserRecord = {
  nick: string;
  hits: number;
  total: number;
  streak: number;
  best: number;
};

type PredictStatus = {
  connected: boolean;
  record: UserRecord | null;
  predictedToday: boolean;
  todaySide: Side | null;
};

type LeaderboardEntry = {
  rank: number;
  nick: string;
  hits: number;
  total: number;
  streak: number;
  best: number;
  isMe: boolean;
};

type LeaderboardPayload = {
  connected: boolean;
  sort: LbSort;
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

/* ---------- 유틸 ---------- */

function accLabel(hits: number, total: number): string {
  return total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : "-";
}

/** 다음 KST 자정(UTC+9 기준 00:00)까지 남은 시간 "N시간 N분 N초" */
function msUntilKstMidnight(now: number): number {
  const KST = 9 * 60 * 60 * 1000;
  const kstNow = now + KST;
  const dayMs = 24 * 60 * 60 * 1000;
  const sinceMidnight = ((kstNow % dayMs) + dayMs) % dayMs;
  return dayMs - sinceMidnight;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}시간 ${m}분 ${s}초`;
}

function Countdown() {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{formatCountdown(msUntilKstMidnight(now))}</>;
}

/* ---------- 메인 ---------- */

export default function PredictClient() {
  const [mounted, setMounted] = useState(false);
  const [uid, setUid] = useState("");
  const [hasNick, setHasNick] = useState(false);
  const [nickInput, setNickInput] = useState("");

  const [status, setStatus] = useState<PredictStatus | null>(null);
  const [board, setBoard] = useState<LeaderboardPayload | null>(null);
  const [sort, setSort] = useState<LbSort>("streak");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyToday, setAlreadyToday] = useState(false);

  const loadStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/predict?userId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as PredictStatus;
      setStatus(data);
    } catch {
      setStatus({
        connected: false,
        record: null,
        predictedToday: false,
        todaySide: null,
      });
    }
  }, []);

  const loadBoard = useCallback(async (id: string, s: LbSort) => {
    try {
      const res = await fetch(
        `/api/leaderboard?sort=${s}&me=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as LeaderboardPayload;
      setBoard(data);
    } catch {
      setBoard({ connected: false, sort: s, top: [], me: null });
    }
  }, []);

  // 마운트: 클라이언트에서만 userId/nick 읽고 초기 로드
  useEffect(() => {
    setMounted(true);
    const id = getUserId();
    setUid(id);
    setHasNick(Boolean(getNick()));
    void loadStatus(id);
    void loadBoard(id, "streak");
  }, [loadStatus, loadBoard]);

  function handleStartNick() {
    const clean = nickInput.trim().slice(0, 16);
    if (!clean) return;
    setNick(clean);
    setHasNick(true);
  }

  function handleSort(s: LbSort) {
    if (s === sort) return;
    setSort(s);
    void loadBoard(uid, s);
  }

  async function handlePredict(side: Side) {
    if (submitting) return;
    setSubmitting(true);
    setAlreadyToday(false);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, nick: getNick() ?? "", side }),
      });
      const data = (await res.json()) as { ok: boolean; reason?: string };
      if (data.ok) {
        await Promise.all([loadStatus(uid), loadBoard(uid, sort)]);
      } else if (data.reason === "already_today") {
        setAlreadyToday(true);
        await loadStatus(uid);
      }
    } catch {
      // 조용히 무시
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- 마운트 전 스켈레톤 ---------- */
  if (!mounted) {
    return (
      <div className="surface rounded-2xl p-6">
        <p className="txt-muted text-sm">불러오는 중…</p>
      </div>
    );
  }

  /* ---------- 닉네임 게이트 ---------- */
  if (!hasNick) {
    const canStart = nickInput.trim().length > 0;
    return (
      <section className="surface rounded-2xl p-6 space-y-4">
        <h1 className="txt-strong text-xl font-bold">닉네임을 정해주세요</h1>
        <p className="txt-muted text-sm leading-relaxed">
          리더보드에 표시될 이름이에요. 나중에 구글 로그인으로 이어갈 수 있어요.
        </p>
        <input
          type="text"
          value={nickInput}
          onChange={(e) => setNickInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStartNick();
          }}
          maxLength={16}
          placeholder="예: 문어대장"
          className="surface-solid border-app w-full rounded-xl border px-4 py-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleStartNick}
          disabled={!canStart}
          className="btn-accent w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-40"
        >
          시작하기
        </button>
      </section>
    );
  }

  const record = status?.record ?? null;

  return (
    <div className="space-y-8">
      {/* ---------- 오늘의 예측 ---------- */}
      <section className="surface rounded-2xl p-6 space-y-5">
        {status?.predictedToday ? (
          <div className="space-y-4">
            <h2 className="txt-muted text-sm font-medium">오늘의 내 예언</h2>
            <p
              className={`text-4xl font-black ${
                status.todaySide === "LONG" ? "txt-long" : "txt-short"
              }`}
            >
              {status.todaySide === "LONG" ? "📈 롱" : "📉 숏"}
            </p>
            <p className="txt-muted text-sm leading-relaxed">
              결과는 예측 24시간 뒤 성적표에 반영돼요.
            </p>
            <p className="txt-faint text-xs">
              다음 예측까지 <Countdown />
            </p>
            {record && (
              <div className="border-app flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 text-sm">
                <span className="txt-strong font-semibold">
                  🔥 {record.streak} 연속
                </span>
                <span className="txt-muted">
                  적중 {record.hits}/{record.total}
                </span>
                <span className="txt-muted">최고 {record.best}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="txt-strong text-xl font-bold">
              오늘 비트코인, 롱일까 숏일까?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePredict("LONG")}
                disabled={submitting}
                className="btn-accent rounded-xl px-4 py-5 text-lg font-bold disabled:opacity-40"
              >
                📈 롱
              </button>
              <button
                type="button"
                onClick={() => handlePredict("SHORT")}
                disabled={submitting}
                className="surface-solid border-app txt-short rounded-xl border px-4 py-5 text-lg font-bold disabled:opacity-40"
              >
                📉 숏
              </button>
            </div>
            {alreadyToday && (
              <p className="txt-warn text-sm">오늘은 이미 예측했어요</p>
            )}
            <p className="txt-faint text-xs leading-relaxed">
              하루 한 번만 예측할 수 있어요. 결과는 24시간 뒤 성적표에 반영돼요.
            </p>
          </div>
        )}
      </section>

      {/* ---------- 리더보드 ---------- */}
      <section className="surface rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="txt-strong text-lg font-bold">리더보드</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSort("streak")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                sort === "streak"
                  ? "btn-accent"
                  : "surface-solid border-app txt-muted border"
              }`}
            >
              🔥 연속 스트릭
            </button>
            <button
              type="button"
              onClick={() => handleSort("acc")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                sort === "acc"
                  ? "btn-accent"
                  : "surface-solid border-app txt-muted border"
              }`}
            >
              🎯 적중률
            </button>
          </div>
        </div>

        {board && !board.connected ? (
          <p className="txt-muted text-sm">리더보드는 곧 열려요</p>
        ) : (
          <>
            {board && board.top.length > 0 ? (
              <ul className="space-y-2">
                {board.top.map((e) => (
                  <li
                    key={`${e.rank}-${e.nick}`}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
                      e.isMe
                        ? "surface-solid txt-accent border-2"
                        : "surface-solid border-app border"
                    }`}
                    style={e.isMe ? { borderColor: "var(--accent-strong)" } : undefined}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="txt-faint tabular-nums">#{e.rank}</span>
                      <span className="txt-strong truncate font-medium">
                        {e.nick}
                      </span>
                      {e.isMe && (
                        <span className="btn-accent rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                          나
                        </span>
                      )}
                    </span>
                    {sort === "streak" ? (
                      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="txt-strong font-semibold">
                          {e.streak}연속
                        </span>
                        <span className="txt-faint text-xs">최고 {e.best}</span>
                      </span>
                    ) : (
                      <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="txt-strong font-semibold">
                          {accLabel(e.hits, e.total)}
                        </span>
                        <span className="txt-faint text-xs">
                          {e.hits}/{e.total}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="txt-muted text-sm">
                아직 순위가 없어요. 첫 예측의 주인공이 되어보세요!
              </p>
            )}

            {board?.me &&
              !board.top.some((e) => e.isMe) &&
              (board.me.rank === 0 ? (
                <p className="txt-faint text-xs">
                  적중률 순위는 5회 이상 예측하면 등록돼요
                </p>
              ) : (
                <p className="txt-muted border-app border-t pt-3 text-sm">
                  내 순위: #{board.me.rank} ·{" "}
                  {sort === "streak"
                    ? `${board.me.streak}연속`
                    : accLabel(board.me.hits, board.me.total)}
                </p>
              ))}
          </>
        )}
      </section>

      {/* ---------- 하단 안내 ---------- */}
      <p className="txt-faint text-[11px] leading-relaxed">
        재미로 보는 예측 게임입니다. 실제 투자 판단·수익과 무관해요.
      </p>
    </div>
  );
}
