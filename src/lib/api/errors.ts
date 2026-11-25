export const ApiStatus = {
  Success: 0, ServerError: 1, BadRequest: 2, NotFound: 3, ListEmpty: 4,
  LogicError: 5, UnAuthorized: 6, NoContent: 7, Forbidden: 8, Conflict: 9,
  UnprocessableEntity: 10, TooManyRequests: 11, CaptchaInvalid: 12,
  InvalidCredentials: 13, InvalidOtp: 14,
} as const;

/** Generic (client-side) error codes in addition to the stable codes returned by the backend (`errorCode`). */
export const GenericErrorCode = {
  Unauthorized: "UNAUTHORIZED",
  Forbidden: "FORBIDDEN",
  NotFound: "NOT_FOUND",
  Conflict: "CONFLICT",
  ValidationFailed: "VALIDATION_FAILED",
  TooManyRequests: "TOO_MANY_REQUESTS",
  InternalError: "INTERNAL_ERROR",
  NetworkError: "NETWORK_ERROR",
  Timeout: "TIMEOUT",
  Unknown: "UNKNOWN",
} as const;

export type ApiErrorKind =
  | "validation" | "unauthorized" | "forbidden" | "not-found" | "conflict"
  | "rate-limit" | "server" | "network" | "timeout" | "unknown";

/** Field-level validation errors, keyed by camelCase field name. */
export type FieldErrors = Record<string, string[]>;

export type ApiErrorInit = {
  /** HTTP status code (0 when no response was received). */
  httpStatus?: number;
  /** Stable backend error code, e.g. `INVALID_OTP`. Optional: older backends do not send it. */
  errorCode?: string | null;
  fieldErrors?: FieldErrors;
  traceId?: string | null;
};

export class ApiError extends Error {
  /** Backend `statusCode` (ApiStatus) or HTTP status when no envelope was returned. */
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly errorCode: string | null;
  readonly httpStatus: number;
  readonly fieldErrors: FieldErrors;
  readonly traceId: string | null;

  constructor(status: number, message = "", kind?: ApiErrorKind, init: ApiErrorInit = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.httpStatus = init.httpStatus ?? 0;
    this.kind = kind ?? classify(status, this.httpStatus, init.errorCode ?? null);
    this.errorCode = init.errorCode ?? null;
    this.fieldErrors = init.fieldErrors ?? {};
    this.traceId = init.traceId ?? null;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function classify(status: number, httpStatus = 0, errorCode: string | null = null): ApiErrorKind {
  if (errorCode === GenericErrorCode.Timeout) return "timeout";
  if (errorCode === GenericErrorCode.NetworkError) return "network";
  const http = httpStatus || (status >= 100 ? status : 0);
  if (http === 401 || status === ApiStatus.UnAuthorized) return "unauthorized";
  if (http === 403 || status === ApiStatus.Forbidden) return "forbidden";
  if (http === 404 || status === ApiStatus.NotFound) return "not-found";
  if (http === 409 || status === ApiStatus.Conflict) return "conflict";
  if (http === 429 || status === ApiStatus.TooManyRequests) return "rate-limit";
  if (http >= 500 || status === ApiStatus.ServerError) return "server";
  if (
    http === 400 || http === 422 ||
    [ApiStatus.BadRequest, ApiStatus.UnprocessableEntity, ApiStatus.LogicError, ApiStatus.CaptchaInvalid, ApiStatus.InvalidCredentials, ApiStatus.InvalidOtp].some((s) => s === status)
  ) return "validation";
  return "unknown";
}
