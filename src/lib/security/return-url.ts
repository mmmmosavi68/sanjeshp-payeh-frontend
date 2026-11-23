import { isProtectedPath } from "@/lib/auth/routes";
import { routing } from "@/i18n/routing";

const localePattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/**
 * returnUrl فقط مسیر داخلی و مجاز است (ضد open redirect).
 * خروجی بدون پیشوند زبان است تا router زبان‌دار خودش اضافه کند.
 */
export function safeReturnUrl(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw || raw.length > 512) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }
  if ([...raw].some((char) => char.charCodeAt(0) < 32)) return fallback;

  const withoutLocale = raw.replace(localePattern, "") || "/";
  const pathOnly = withoutLocale.split(/[?#]/)[0];

  // فقط صفحه‌های داخلیِ محافظت‌شده (نه /login و نه /api)؛ ضد open redirect و حلقه‌ی ریدایرکت.
  const allowed = isProtectedPath(pathOnly) && !/^\/api(\/|$)/.test(pathOnly);

  return allowed ? withoutLocale : fallback;
}