/**
 * 구글 로그인 (경량 OAuth 2.0, 서버 전용) — 외부 인증 라이브러리 없이 구현.
 *
 * authorization-code 흐름: /api/auth/login → 구글 동의 → /api/auth/callback 에서
 * code 를 토큰으로 교환하고 id_token 을 디코드해 세션 쿠키(서명)를 굽는다.
 * id_token 은 구글 토큰 엔드포인트에서 서버-서버(TLS)로 직접 받으므로 신뢰한다.
 *
 * 환경변수(3개 모두 있어야 활성): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET.
 * 없으면 authEnabled=false 로 로그인 UI가 숨겨지고 익명 흐름만 동작한다.
 */

import crypto from "node:crypto";
import { SITE_URL } from "@/config/site";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const SECRET = process.env.AUTH_SECRET ?? "";

export const authEnabled = Boolean(CLIENT_ID && CLIENT_SECRET && SECRET);

export const SESSION_COOKIE = "tako_session";
export const STATE_COOKIE = "tako_oauth_state";
export const REDIRECT_URI = `${SITE_URL}/api/auth/callback`;
const SESSION_TTL = 30 * 24 * 60 * 60; // 30일 (초)

export type Session = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

/** 구글 동의 화면 URL */
export function buildGoogleAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export type ExchangeResult = { session: Session } | { error: string };

/** code → 토큰 교환 → id_token 디코드 → Session (실패 시 사유 반환) */
export async function exchangeCode(code: string): Promise<ExchangeResult> {
  if (!authEnabled) return { error: "disabled" };
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      let e = `http_${res.status}`;
      try {
        const j = (await res.json()) as { error?: string };
        if (j?.error) e = String(j.error);
      } catch {
        // 본문 파싱 실패 → 상태코드만
      }
      return { error: e };
    }
    const data = (await res.json()) as { id_token?: string };
    const part = data.id_token?.split(".")[1];
    if (!part) return { error: "no_id_token" };
    const payload = JSON.parse(
      Buffer.from(part, "base64url").toString("utf8")
    ) as { sub?: string; email?: string; name?: string; picture?: string };
    if (!payload.sub) return { error: "no_sub" };
    return {
      session: {
        sub: payload.sub,
        email: payload.email ?? "",
        name: payload.name ?? "익명",
        picture: payload.picture ?? "",
      },
    };
  } catch {
    return { error: "fetch_fail" };
  }
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** 세션 쿠키 값 생성 (payload.서명) */
export function signSession(s: Session): string {
  const payload = { ...s, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

/** 세션 쿠키 검증 → Session (위조·만료면 null) */
export function verifySession(cookieVal: string | undefined | null): Session | null {
  if (!cookieVal || !SECRET) return null;
  const [body, sig] = cookieVal.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as
      & Session
      & { exp: number };
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: p.sub, email: p.email, name: p.name, picture: p.picture };
  } catch {
    return null;
  }
}
