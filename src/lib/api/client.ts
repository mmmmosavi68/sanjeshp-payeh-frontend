import { z } from "zod";
import { COOKIE, CSRF_HEADER } from "@/lib/auth/cookie-names";
import { buildLoginUrl } from "@/lib/api/redirect";
import { ApiError, ApiStatus, GenericErrorCode, type FieldErrors } from "./errors";

const REQUEST_TIMEOUT_MS = 30_000;

/** ApiResult envelope. `errorCode` is optional (older backends do not send it). */
const envelopeSchema = z.object({
  isSuccess: z.boolean(),
  statusCode: z.number(),
  message: z.string().nullish(),
  errorCode: z.string().nullish(),
  data: z.unknown().optional(),
  errors: z.record(z.string(), z.unknown()).nullish(),
});

function readCookie(name: string): string | null {
  const entry = document.cookie
    .split(";")
    .map((row) => row.trim())
    .find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function redirectToLogin() {
  const { pathname, search } = window.location;
  if (/\/login(\/|$)/.test(pathname)) return;
  // Hard navigation on purpose: it drops every in-memory client state of the expired session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(buildLoginUrl(document.documentElement.lang, pathname + search));
}

/** ASP.NET `errors: { Field: ["msg"] }` → `{ field: ["msg"] }` */
function toFieldErrors(raw: Record<string, unknown> | null | undefined): FieldErrors {
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    const messages = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === "string" && v.trim() !== "");
    if (messages.length === 0) continue;
    const name = key.replace(/^\$\./, "");
    out[name.charAt(0).toLowerCase() + name.slice(1)] = messages;
  }
  return out;
}

async function readJson(response: Response): Promise<unknown> {
  // 204/205 or empty / non-JSON bodies (e.g. legacy empty 401/403) must never throw.
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

type RequestOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  schema: z.ZodType<T>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrf = readCookie(COOKIE.csrf);
    if (csrf) headers[CSRF_HEADER] = csrf;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(`/api/bff/${path}${queryString ? `?${queryString}` : ""}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    const timedOut = controller.signal.aborted && !options.signal?.aborted;
    throw new ApiError(
      ApiStatus.ServerError,
      "",
      timedOut ? "timeout" : "network",
      { errorCode: timedOut ? GenericErrorCode.Timeout : GenericErrorCode.NetworkError },
    );
  } finally {
    clearTimeout(timer);
  }

  const traceId = response.headers.get("x-trace-id");
  const json = response.status === 204 ? null : await readJson(response);
  const envelope = envelopeSchema.safeParse(json);
  const env = envelope.success ? envelope.data : null;
  const errorCode = env?.errorCode ?? null;
  const init = { httpStatus: response.status, errorCode, traceId, fieldErrors: toFieldErrors(env?.errors ?? null) };

  if (response.status === 401) {
    redirectToLogin();
    throw new ApiError(ApiStatus.UnAuthorized, env?.message ?? "", undefined, { ...init, errorCode: errorCode ?? GenericErrorCode.Unauthorized });
  }

  if (response.status === 403) {
    throw new ApiError(ApiStatus.Forbidden, env?.message ?? "", undefined, { ...init, errorCode: errorCode ?? GenericErrorCode.Forbidden });
  }

  if (!response.ok || (env && !env.isSuccess)) {
    throw new ApiError(env ? env.statusCode : response.status >= 500 ? ApiStatus.ServerError : ApiStatus.BadRequest, env?.message ?? "", undefined, init);
  }

  if (response.status === 204 || (json === null && !env)) {
    const empty = options.schema.safeParse(undefined);
    if (!empty.success) throw new ApiError(ApiStatus.ServerError, "", undefined, { ...init, errorCode: GenericErrorCode.InternalError });
    return empty.data;
  }

  if (!env) throw new ApiError(ApiStatus.ServerError, "", undefined, { ...init, errorCode: GenericErrorCode.InternalError });

  const data = options.schema.safeParse(env.data);
  if (!data.success) {
    // Only invalid field paths are logged — response content may contain personal data.
    console.error(`[apiRequest] Response validation failed on "${path}":`, data.error.issues.map((issue) => issue.path.join(".")));
    throw new ApiError(ApiStatus.ServerError, "", undefined, { ...init, errorCode: GenericErrorCode.InternalError });
  }

  return data.data;
}
