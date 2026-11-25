import { ApiError, GenericErrorCode, type ApiErrorKind, type FieldErrors } from "./errors";

/** Minimal translator contract (compatible with next-intl's `useTranslations()` without namespace). */
export type Translator = {
  (key: string): string;
  has: (key: string) => boolean;
};

const KIND_TO_CODE: Record<ApiErrorKind, string> = {
  validation: GenericErrorCode.ValidationFailed,
  unauthorized: GenericErrorCode.Unauthorized,
  forbidden: GenericErrorCode.Forbidden,
  "not-found": GenericErrorCode.NotFound,
  conflict: GenericErrorCode.Conflict,
  "rate-limit": GenericErrorCode.TooManyRequests,
  server: GenericErrorCode.InternalError,
  network: GenericErrorCode.NetworkError,
  timeout: GenericErrorCode.Timeout,
  unknown: GenericErrorCode.Unknown,
};

/** Server-provided free text is only trusted for business/validation failures — never for 5xx/network. */
const MESSAGE_KINDS: ApiErrorKind[] = ["validation", "conflict", "not-found", "forbidden", "unknown"];

/**
 * Resolves a user-facing message in the current language:
 *  1. `errors.<errorCode>` translation, 2. server `message`, 3. translated generic message by error kind,
 *  4. `fallback`. Technical details / stack traces are never exposed.
 */
export function resolveErrorMessage(error: unknown, t: Translator, fallback?: string): string {
  if (error instanceof ApiError) {
    if (error.errorCode && t.has(`errors.${error.errorCode}`)) return t(`errors.${error.errorCode}`);

    const message = error.message.trim();
    if (message && MESSAGE_KINDS.includes(error.kind)) {
      return message;
    }

    const generic = `errors.${KIND_TO_CODE[error.kind]}`;
    if (error.kind !== "unknown" && t.has(generic)) return t(generic);
  }
  return fallback ?? t("common.operationFailed");
}

/** First message per field from a validation failure, e.g. `{ title: "…" }`. */
export function firstFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const fields: FieldErrors = error.fieldErrors;
  return Object.fromEntries(Object.entries(fields).map(([key, list]) => [key, list[0]]));
}
