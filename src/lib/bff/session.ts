import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { BackendResult } from "@/lib/api/backend";
import { ApiStatus } from "@/lib/api/errors";
import type { Tokens } from "@/lib/auth/backend-session";
import { COOKIE } from "@/lib/auth/cookie-names";
import { setSessionCookies } from "@/lib/auth/cookies";
import { randomToken } from "@/lib/security/tokens";

import { NO_STORE, badGateway, fail, relay } from "./responses";

const rawTokenSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresIn: z.coerce.number().positive().optional(),
    expiresInSeconds: z.coerce.number().positive().optional(),
    sessionId: z.union([z.string(), z.number()]).nullish(),
  })
  .transform((val) => ({
    accessToken: val.accessToken,
    refreshToken: val.refreshToken,
    expiresIn: Math.round(val.expiresIn ?? val.expiresInSeconds ?? 900),
    sessionId: val.sessionId != null ? String(val.sessionId) : undefined,
  }));

/** توکن‌ها را از پاسخ جدا می‌کند؛ توکن هرگز به کلاینت نمی‌رسد. */
export function splitSession(data: unknown): { tokens: Tokens | null; publicData: unknown } {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if ("requiresOtp" in record || "auth" in record || "tokens" in record) {
      const candidate = record.auth ?? record.tokens ?? record;
      const auth = rawTokenSchema.safeParse(candidate);
      const rest = { ...record };
      delete rest.auth;
      delete rest.tokens;
      delete rest.accessToken;
      delete rest.refreshToken;
      return { tokens: auth.success ? auth.data : null, publicData: rest };
    }

    const direct = rawTokenSchema.safeParse(record);
    if (direct.success) {
      return {
        tokens: direct.data,
        publicData: { sessionId: direct.data.sessionId ?? null },
      };
    }
  }

  return { tokens: null, publicData: data };
}

export function createSession(request: NextRequest, result: BackendResult): NextResponse {
  if (result.status < 200 || result.status >= 300) return relay(result);

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.body);
  } catch {
    return badGateway();
  }
  if (typeof parsed !== "object" || parsed === null) return badGateway();

  const envelope = parsed as { isSuccess?: boolean; data?: unknown };
  const { tokens, publicData } = splitSession(envelope.data);

  const requiresOtp =
    publicData &&
    typeof publicData === "object" &&
    (publicData as { requiresOtp?: boolean }).requiresOtp === true;

  if (envelope.isSuccess !== false && !requiresOtp && !tokens) {
    // فقط نام فیلدها لاگ می‌شود؛ مقدار (احتمالاً توکن) هرگز لاگ نمی‌شود.
    const keys =
      envelope.data && typeof envelope.data === "object" ? Object.keys(envelope.data) : [];
    console.error("[bff] Login response succeeded but tokens could not be parsed. Fields:", keys);
    return fail(502, ApiStatus.ServerError, "Invalid token payload from authentication server");
  }

  const response = NextResponse.json(
    { ...(parsed as object), data: publicData },
    { status: result.status, headers: NO_STORE },
  );

  if (tokens) setSessionCookies(response, tokens);

  if (!request.cookies.get(COOKIE.csrf)?.value) {
    response.cookies.set(COOKIE.csrf, randomToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
