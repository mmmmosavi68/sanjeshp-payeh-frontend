import "server-only";
import { isIP } from "node:net";
import type { NextRequest, NextResponse } from "next/server";

import type { ClientContext } from "@/lib/api/backend";
import { ApiStatus } from "@/lib/api/errors";
import { COOKIE, CSRF_HEADER } from "@/lib/auth/cookie-names";
import { env } from "@/lib/env.server";
import { isSameOrigin } from "@/lib/security/origin";
import { safeEqual } from "@/lib/security/tokens";

import { fail } from "./responses";

export const MAX_BODY = 64 * 1024;
export const MAX_QUERY = 1024;

/** Origin + CSRF double-submit برای همه‌ی متدهای تغییردهنده. */
export function checkMutationGuards(request: NextRequest): NextResponse | null {
  if (!isSameOrigin(request)) return fail(403, ApiStatus.Forbidden, "Forbidden");

  const cookieToken = request.cookies.get(COOKIE.csrf)?.value ?? "";
  const headerToken = request.headers.get(CSRF_HEADER) ?? "";

  if (!cookieToken || !safeEqual(cookieToken, headerToken)) {
    return fail(403, ApiStatus.Forbidden, "Forbidden");
  }
  return null;
}

type BodyResult = { body?: string; error?: NextResponse };

/** بدنه را به‌صورت stream می‌خواند و بالای MAX_BODY قطع می‌کند (حتی بدون Content-Length). */
export async function readJsonBody(request: NextRequest): Promise<BodyResult> {
  const tooLarge = () => ({ error: fail(413, ApiStatus.BadRequest, "Payload too large") });

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY) return tooLarge();

  if (!request.body) return {};

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY) {
      void reader.cancel();
      return tooLarge();
    }
    chunks.push(value);
  }

  if (total === 0) return {};

  const text = new TextDecoder().decode(Buffer.concat(chunks));

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { error: fail(415, ApiStatus.BadRequest, "Unsupported media type") };
  }
  return { body: text };
}

/** IP کلاینت فقط پشت reverse proxy مورد اعتماد و پس از اعتبارسنجی IP پذیرفته می‌شود. */
export function clientContext(request: NextRequest): ClientContext {
  let clientIp: string | undefined;

  if (env.TRUST_PROXY === "1") {
    const candidate = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (candidate && isIP(candidate)) clientIp = candidate;
  }

  return { clientIp, userAgent: request.headers.get("user-agent")?.slice(0, 512) };
}
