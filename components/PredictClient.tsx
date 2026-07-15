"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/* ---------- 로컬 타입 (API 계약과 일치) ---------- */

type Side = "LONG" | "SHORT";
type Tf = "4h" | "1d" | "1w" | "1mo" | "1y";
type LbKey = "all" | Tf;
type LbSort = "acc" | "streak";

type TfState = {
  hits: number;
  total: number;
  streak: number;
  best: number;
  pickedSide: Side | null;
  periodEnd: number;
};

type PredictData =
  | { loggedIn: false }
  | {
      loggedIn: true;
      name: string;
      picture: string;
      nick: string;
      picOn: boolean;
      nickChangeableAt: number;
      connected: boolean;
      perTf: Record<Tf, TfState>;
      combined: { hits: number; total: number; streak: number };
    };

type Entry = {
  rank: number;
  nick: string;
  pic: string;
  hits: number;
  total: number;
  streak: number;
  isMe: boolean;
};

type BoardData = {
  connected: boolean;
  key: LbKey;
  sort: LbSort;
  top: Entry[];
  me: Entry | null;
};

/* ---------- 상수 ---------- */

const TF_ORDER: Tf[] = ["4h", "1d", "1w", "1mo", "1y"];
const LB_KEYS: LbKey[] = ["all", "4h", "1d", "1w", "1mo", "1y"];

/* ---------- 유틸 ---------- */

function accLabel(hits: number, total: number): string {
  return total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : "-";
}

function fmtDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/* ---------- 메인 ---------- */

export default function PredictClient() {
  const t = useTranslations("pages");
  const tfLabel = (tf: Tf) => t(`predict.tf.${tf}`);
  const lbTabLabel = (key: LbKey) =>
    key === "all" ? t("predict.lbAll") : t(`predict.tf.${key}`);
  const formatRemaining = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return t("predict.remaining", { h, m, s });
  };

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PredictData | null>(null);

  const [board, setBoard] = useState<BoardData | null>(null);
  const [lbKey, setLbKey] = useState<LbKey>("all");
  const [lbSort, setLbSort] = useState<LbSort>("acc");

  const [submittingTf, setSubmittingTf] = useState<Tf | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  /* 설정 패널 */
  const [showSettings, setShowSettings] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const [nickMsg, setNickMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [savingNick, setSavingNick] = useState(false);
  const [savingPic, setSavingPic] = useState(false);

  /* 1초 틱 (카운트다운) */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadPredict = useCallback(async () => {
    try {
      const res = await fetch("/api/predict", { cache: "no-store" });
      const j = (await res.json()) as PredictData;
      setData(j);
    } catch {
      setData({ loggedIn: false });
    }
  }, []);

  const loadBoard = useCallback(async (key: LbKey, sort: LbSort) => {
    try {
      const res = await fetch(`/api/leaderboard?key=${key}&sort=${sort}`, {
        cache: "no-store",
      });
      const j = (await res.json()) as BoardData;
      setBoard(j);
    } catch {
      setBoard({ connected: false, key, sort, top: [], me: null });
    }
  }, []);

  /* 마운트: 예측 상태 로드 */
  useEffect(() => {
    setMounted(true);
    void loadPredict();
  }, [loadPredict]);

  /* 로그인 상태에서 탭/정렬이 바뀌면 리더보드 재fetch */
  const loggedIn = data?.loggedIn === true;
  useEffect(() => {
    if (loggedIn) void loadBoard(lbKey, lbSort);
  }, [loggedIn, lbKey, lbSort, loadBoard]);

  async function submit(tf: Tf, side: Side) {
    if (submittingTf) return;
    setSubmittingTf(tf);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tf, side }),
      });
      const j = (await res.json()) as { ok: boolean; reason?: string };
      if (j.ok) {
        await Promise.all([loadPredict(), loadBoard(lbKey, lbSort)]);
      } else if (j.reason === "already_period") {
        await loadPredict();
      }
    } catch {
      // 조용히 무시
    } finally {
      setSubmittingTf(null);
    }
  }

  /* ---------- 마운트 전 / 로딩 스켈레톤 ---------- */
  if (!mounted || data === null) {
    return (
      <div className="surface rounded-2xl p-6">
        <p className="txt-muted text-sm">{t("predict.loading")}</p>
      </div>
    );
  }

  /* ---------- 비로그인: 로그인 유도 ---------- */
  if (!data.loggedIn) {
    return (
      <section className="surface space-y-4 rounded-2xl p-8 text-center">
        <h1 className="txt-strong text-2xl font-bold">
          {t("predict.loginHeading")}
        </h1>
        <p className="txt-muted text-sm leading-relaxed">
          {t("predict.loginBody")}
        </p>
        <a
          href="/api/auth/login"
          className="btn-accent inline-block rounded-xl px-6 py-3 text-sm font-semibold"
        >
          {t("predict.loginButton")}
        </a>
      </section>
    );
  }

  /* ---------- 로그인 상태 ---------- */
  const { name, picture, nick, picOn, nickChangeableAt, perTf, combined } = data;
  const displayName = nick || name;
  const avatarChar = displayName.trim().charAt(0).toUpperCase() || "🐙";
  const nickLocked = nickChangeableAt > now;
  const combinedAcc =
    combined.total > 0
      ? `${((combined.hits / combined.total) * 100).toFixed(1)}%`
      : "-";

  async function submitNick() {
    if (savingNick || nickLocked) return;
    const next = nickInput.trim();
    if (!next || next === (nick || name)) return;
    setSavingNick(true);
    setNickMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: next }),
      });
      const j = (await res.json()) as {
        ok: boolean;
        reason?: string;
        nickChangeableAt?: number;
      };
      if (res.ok && j.ok) {
        setNickMsg({ text: t("predict.nickChanged"), ok: true });
        await Promise.all([loadPredict(), loadBoard(lbKey, lbSort)]);
      } else if (res.status === 429 || j.reason === "cooldown") {
        setNickMsg({
          text: t("predict.nickNextChange", {
            date: fmtDate(j.nickChangeableAt ?? nickChangeableAt),
          }),
          ok: false,
        });
      } else {
        setNickMsg({ text: t("predict.nickInvalid"), ok: false });
      }
    } catch {
      setNickMsg({ text: t("predict.nickInvalid"), ok: false });
    } finally {
      setSavingNick(false);
    }
  }

  async function togglePic() {
    if (savingPic) return;
    setSavingPic(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picOn: !picOn }),
      });
      const j = (await res.json()) as { ok: boolean };
      if (res.ok && j.ok) {
        await Promise.all([loadPredict(), loadBoard(lbKey, lbSort)]);
      }
    } catch {
      // 조용히 무시
    } finally {
      setSavingPic(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ---------- 프로필 바 ---------- */}
      <section className="surface flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {picOn ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picture}
              referrerPolicy="no-referrer"
              width={40}
              height={40}
              className="rounded-full"
              alt={displayName}
            />
          ) : (
            <span className="surface-solid border-app txt-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
              {avatarChar}
            </span>
          )}
          <div className="min-w-0">
            <p className="txt-strong truncate text-sm font-semibold">
              {displayName}
            </p>
            <p className="txt-muted text-xs">
              🎯 {combinedAcc} · 🔥 {combined.streak}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setNickInput("");
              setNickMsg(null);
              setShowSettings((v) => !v);
            }}
            className="link-accent whitespace-nowrap text-xs"
          >
            {t("predict.settings")}
          </button>
          <a
            href="/api/auth/logout"
            className="link-accent whitespace-nowrap text-xs"
          >
            {t("predict.logout")}
          </a>
        </div>
      </section>

      {/* ---------- 설정 패널 ---------- */}
      {showSettings && (
        <section className="surface space-y-5 rounded-2xl p-5">
          {/* 닉네임 변경 */}
          <div className="space-y-2">
            <p className="txt-strong text-sm font-semibold">
              {t("predict.nickChange")}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={16}
                value={nickInput}
                placeholder={nick || name}
                disabled={nickLocked || savingNick}
                onChange={(e) => setNickInput(e.target.value)}
                className="surface-solid border-app txt-strong min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
              />
              <button
                type="button"
                onClick={submitNick}
                disabled={nickLocked || savingNick}
                className="btn-accent whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                {t("predict.nickSubmit")}
              </button>
            </div>
            {nickLocked ? (
              <p className="txt-faint text-xs">
                {t("predict.nickNextChange", {
                  date: fmtDate(nickChangeableAt),
                })}
              </p>
            ) : (
              <p className="txt-faint text-xs">{t("predict.nickHint")}</p>
            )}
            {nickMsg && (
              <p className={`text-xs ${nickMsg.ok ? "txt-muted" : "txt-short"}`}>
                {nickMsg.text}
              </p>
            )}
          </div>

          {/* 프로필 사진 표시 */}
          <div className="border-app flex items-center justify-between gap-3 border-t pt-4">
            <span className="txt-strong text-sm font-semibold">
              {t("predict.picShow")}
            </span>
            <button
              type="button"
              onClick={togglePic}
              disabled={savingPic}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${
                picOn ? "btn-accent" : "surface-solid border-app txt-muted border"
              }`}
            >
              {picOn ? t("predict.on") : t("predict.off")}
            </button>
          </div>
        </section>
      )}

      {/* ---------- 시간대별 예언 ---------- */}
      <section className="space-y-4">
        <h2 className="txt-strong text-lg font-bold">
          {t("predict.tfHeading")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TF_ORDER.map((tf) => {
            const st = perTf[tf];
            const remaining = st.periodEnd - now;
            const settling = remaining <= 0;
            const submitting = submittingTf === tf;
            return (
              <div key={tf} className="surface space-y-3 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="txt-strong text-sm font-bold">
                    {tfLabel(tf)}
                  </span>
                  <span className="txt-faint whitespace-nowrap text-xs tabular-nums">
                    {settling ? t("predict.settling") : formatRemaining(remaining)}
                  </span>
                </div>

                {st.pickedSide ? (
                  <div className="space-y-1">
                    <p
                      className={`text-2xl font-black ${
                        st.pickedSide === "LONG" ? "txt-long" : "txt-short"
                      }`}
                    >
                      {t("predict.myPick", {
                        side:
                          st.pickedSide === "LONG"
                            ? t("predict.long")
                            : t("predict.short"),
                      })}
                    </p>
                    <p className="txt-faint text-xs">
                      {t("predict.gradedAfterClose")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => submit(tf, "LONG")}
                      disabled={submitting}
                      className="btn-accent rounded-xl px-3 py-3 text-sm font-bold disabled:opacity-40"
                    >
                      {t("predict.long")}
                    </button>
                    <button
                      type="button"
                      onClick={() => submit(tf, "SHORT")}
                      disabled={submitting}
                      className="surface-solid border-app txt-short rounded-xl border px-3 py-3 text-sm font-bold disabled:opacity-40"
                    >
                      {t("predict.short")}
                    </button>
                  </div>
                )}

                <p className="txt-faint border-app border-t pt-2 text-xs">
                  {t("predict.tfStats", {
                    hits: st.hits,
                    total: st.total,
                    streak: st.streak,
                    best: st.best,
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- 리더보드 ---------- */}
      <section className="surface space-y-4 rounded-2xl p-6">
        <h2 className="txt-strong text-lg font-bold">
          {t("predict.leaderboard")}
        </h2>

        {/* key 탭 */}
        <div className="flex flex-wrap gap-2">
          {LB_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setLbKey(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                lbKey === key
                  ? "btn-accent"
                  : "surface-solid border-app txt-muted border"
              }`}
            >
              {lbTabLabel(key)}
            </button>
          ))}
        </div>

        {/* 정렬 토글 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLbSort("acc")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              lbSort === "acc"
                ? "btn-accent"
                : "surface-solid border-app txt-muted border"
            }`}
          >
            {t("predict.sortAcc")}
          </button>
          <button
            type="button"
            onClick={() => setLbSort("streak")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              lbSort === "streak"
                ? "btn-accent"
                : "surface-solid border-app txt-muted border"
            }`}
          >
            {t("predict.sortStreak")}
          </button>
        </div>

        {board && !board.connected ? (
          <p className="txt-muted text-sm">{t("predict.lbClosed")}</p>
        ) : (
          <>
            {board && board.top.length > 0 ? (
              <ul className="space-y-2">
                {board.top.map((e) => {
                  const medal =
                    e.rank === 1
                      ? "🥇"
                      : e.rank === 2
                        ? "🥈"
                        : e.rank === 3
                          ? "🥉"
                          : null;
                  let borderColor: string | undefined;
                  if (e.isMe) borderColor = "var(--accent-strong)";
                  else if (e.rank === 1) borderColor = "#eab308";
                  else if (e.rank === 2) borderColor = "#9ca3af";
                  else if (e.rank === 3) borderColor = "#b45309";
                  return (
                    <li
                      key={`${e.rank}-${e.nick}`}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${
                        borderColor ? "surface-solid" : "surface-solid border-app"
                      }`}
                      style={borderColor ? { borderColor } : undefined}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="txt-faint w-6 shrink-0 tabular-nums">
                          {medal ?? `#${e.rank}`}
                        </span>
                        {e.pic ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={e.pic}
                            referrerPolicy="no-referrer"
                            width={24}
                            height={24}
                            className="rounded-full"
                            alt={e.nick}
                          />
                        ) : null}
                        <span className="txt-strong truncate font-medium">
                          {e.nick}
                        </span>
                        {e.isMe && (
                          <span className="btn-accent rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            {t("predict.me")}
                          </span>
                        )}
                      </span>
                      {lbSort === "acc" ? (
                        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <span className="txt-strong font-semibold">
                            {accLabel(e.hits, e.total)}
                          </span>
                          <span className="txt-faint text-xs">
                            {e.hits}/{e.total}
                          </span>
                        </span>
                      ) : (
                        <span className="txt-strong whitespace-nowrap font-semibold">
                          {t("predict.streakCount", { streak: e.streak })}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="txt-muted text-sm">{t("predict.noRanking")}</p>
            )}

            {/* 내 랭킹 하단 고정 */}
            <div className="border-app border-t pt-3">
              {board && board.me ? (
                board.me.rank === 0 ? (
                  <p className="txt-muted text-sm">
                    {t("predict.accNeedThree")}
                  </p>
                ) : (
                  <p
                    className="surface-solid txt-accent flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold"
                    style={{ borderColor: "var(--accent-strong)" }}
                  >
                    <span>{t("predict.myRank", { rank: board.me.rank })}</span>
                    <span className="whitespace-nowrap">
                      {lbSort === "acc"
                        ? accLabel(board.me.hits, board.me.total)
                        : t("predict.streakCount", { streak: board.me.streak })}
                    </span>
                  </p>
                )
              ) : (
                <p className="txt-muted text-sm">{t("predict.noRecord")}</p>
              )}
            </div>
          </>
        )}
      </section>

      {/* ---------- 하단 안내 ---------- */}
      <p className="txt-faint text-[11px] leading-relaxed">
        {t("predict.footer")}
      </p>
    </div>
  );
}
