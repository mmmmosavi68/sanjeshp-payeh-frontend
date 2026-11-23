import "server-only";
import type { NextResponse } from "next/server";
import { env } from "@/lib/env.server";
import type { Tokens } from "./backend-session";
import { COOKIE } from "./cookie-names";

const common = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

/** توکن‌ها فقط برای fetch هم‌سایت به /api/bff لازم‌اند؛ Strict جلوی ارسال در هر درخواست cross-site را می‌گیرد. */
const tokenCookie = { ...common, sameSite: "strict" as const };
/** نشانه‌ی نشست برای ناوبری (لینک مستقیم از سایت دیگر) باید Lax بماند. */
const base = { ...common, sameSite: "lax" as const };

const refreshSeconds = env.REFRESH_COOKIE_DAYS * 24 * 60 * 60;

export function setSessionCookies(response: NextResponse, tokens: Tokens) {
  response.cookies.set(COOKIE.access, tokens.accessToken, {
    ...tokenCookie,
    path: "/api/bff",
    maxAge: Math.max(60, tokens.expiresIn - 30),
  });
  response.cookies.set(COOKIE.refresh, tokens.refreshToken, {
    ...tokenCookie,
    path: "/api/bff",
    maxAge: refreshSeconds,
  });
  response.cookies.set(COOKIE.session, "1", {
    ...base,
    path: "/",
    maxAge: refreshSeconds,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(COOKIE.access, "", { ...tokenCookie, path: "/api/bff", maxAge: 0 });
  response.cookies.set(COOKIE.refresh, "", { ...tokenCookie, path: "/api/bff", maxAge: 0 });
  response.cookies.set(COOKIE.session, "", { ...base, path: "/", maxAge: 0 });
}
