import { ApiError, ApiStatus } from "@/lib/api/errors";

export type AuthErrorKey = "captchaInvalid" | "invalidCredentials" | "invalidOtp" | "tooManyRequests" | "forbidden" | "generic";

const CODE_TO_KEY: Record<string, AuthErrorKey> = {
  COMMON_CAPTCHA: "captchaInvalid",
  CAPTCHA_INVALID: "captchaInvalid",
  COMMON_CREDENTIALS: "invalidCredentials",
  INVALID_CREDENTIALS: "invalidCredentials",
  COMMON_OTP: "invalidOtp",
  INVALID_OTP: "invalidOtp",
  OTP_002: "invalidOtp",
  OTP_003: "invalidOtp",
  COMMON_429: "tooManyRequests",
  TOO_MANY_REQUESTS: "tooManyRequests",
  COMMON_403: "forbidden",
  FORBIDDEN: "forbidden",
};

/** Maps an API error (by `errorCode` first, then by legacy status code) to an `auth.errors.*` translation key. */
export function authErrorKey(error: unknown): AuthErrorKey {
  if (!(error instanceof ApiError)) return "generic";
  if (error.errorCode && CODE_TO_KEY[error.errorCode]) return CODE_TO_KEY[error.errorCode];

  switch (error.status) {
    case ApiStatus.CaptchaInvalid:
      return "captchaInvalid";
    case ApiStatus.InvalidCredentials:
      return "invalidCredentials";
    case ApiStatus.InvalidOtp:
      return "invalidOtp";
    case ApiStatus.TooManyRequests:
      return "tooManyRequests";
    case ApiStatus.Forbidden:
      return "forbidden";
    default:
      return "generic";
  }
}
