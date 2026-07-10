import { NextResponse, type NextRequest } from "next/server";
import { authEnabled, verifySession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const s = verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json(
    {
      loggedIn: Boolean(s),
      authEnabled,
      sub: s?.sub ?? null,
      name: s?.name ?? null,
      picture: s?.picture ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
