import { routing } from "@/i18n/routing";

/** Builds `/{locale}/login?returnUrl=…` from a (possibly locale-prefixed) in-app path. Pure & client/server safe. */
export function buildLoginUrl(lang: string | undefined, currentPath: string): string {
  const locale = (routing.locales as readonly string[]).includes(lang ?? "") ? (lang as string) : routing.defaultLocale;
  const rest = currentPath.replace(new RegExp(`^/(${routing.locales.join("|")})(?=/|\\?|$)`), "") || "/";
  return `/${locale}/login?returnUrl=${encodeURIComponent(rest)}`;
}
