import "server-only";
import { NextResponse } from "next/server";

import type { BackendResult } from "@/lib/api/backend";
import { ApiStatus, GenericErrorCode } from "@/lib/api/errors";
import { clearSessionCookies } from "@/lib/auth/cookies";

export const NO_STORE = { "Cache-Control": "no-store" };

export function fail(httpStatus: number, statusCode: number, message: string, errorCode?: string) {
  return NextResponse.json(
    { isSuccess: false, statusCode, message, ...(errorCode ? { errorCode } : {}) },
    { status: httpStatus, headers: NO_STORE },
  );
}

export function unauthorized() {
  const response = fail(401, ApiStatus.UnAuthorized, "Unauthorized", GenericErrorCode.Unauthorized);
  clearSessionCookies(response);
  return response;
}

export function loggedOut() {
  const response = NextResponse.json(
    { isSuccess: true, statusCode: ApiStatus.Success, message: "" },
    { headers: NO_STORE },
  );
  clearSessionCookies(response);
  return response;
}

export function badGateway() {
  return fail(502, ApiStatus.ServerError, "The server is unavailable", GenericErrorCode.NetworkError);
}

/**
 * پاسخ backend را به کلاینت برمی‌گرداند.
 * - ریدایرکت‌ها و پاسخ غیر JSON رد می‌شوند.
 * - بدنه‌ی خطاهای 5xx (ممکن است جزئیات داخلی/stack داشته باشد) با پیام عمومی جایگزین می‌شود؛
 *   فقط شناسه‌ی trace برای پیگیری عبور می‌کند.
 */
export function relay(result: BackendResult): NextResponse {
  if (result.status >= 300 && result.status < 400) return badGateway();

  const headers = new Headers(NO_STORE);
  const trace = result.headers.get("x-trace-id");
  if (trace && /^[\w.-]{1,128}$/.test(trace)) headers.set("x-trace-id", trace);

  if (result.status >= 500) {
    return NextResponse.json(
      { isSuccess: false, statusCode: ApiStatus.ServerError, message: "Server error", errorCode: GenericErrorCode.InternalError },
      { status: result.status, headers },
    );
  }

  if (result.body === "") {
    return new NextResponse(null, { status: result.status, headers });
  }

  try {
    return NextResponse.json(JSON.parse(result.body), { status: result.status, headers });
  } catch {
    return badGateway();
  }
}
