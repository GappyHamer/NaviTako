import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { authEnabled, buildGoogleAuthUrl, STATE_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  if (!authEnabled) {
    return NextResponse.redirect(new URL("/predict", req.url));
  }

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildGoogleAuthUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
