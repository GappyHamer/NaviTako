import { NextResponse, type NextRequest } from "next/server";
import {
  authEnabled,
  exchangeCode,
  signSession,
  SESSION_COOKIE,
  STATE_COOKIE,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = sp.get("code");
  const state = sp.get("state");
  const saved = req.cookies.get(STATE_COOKIE)?.value;

  if (!authEnabled || !code || !state || state !== saved) {
    return NextResponse.redirect(new URL("/predict?login=error", req.url));
  }

  const session = await exchangeCode(code);
  if (!session) {
    return NextResponse.redirect(new URL("/predict?login=error", req.url));
  }

  const res = NextResponse.redirect(new URL("/predict", req.url));
  res.cookies.set(SESSION_COOKIE, signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}
