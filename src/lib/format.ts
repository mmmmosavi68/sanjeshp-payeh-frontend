import { useFormatter, useLocale } from "next-intl";

/**
 * Locale-aware number/date formatting.
 * fa → Persian digits + Jalali calendar (fa-IR); en → Latin digits + Gregorian (en-US).
 */
export const intlTag = (locale: string) => (locale === "fa" ? "fa-IR" : "en-US");

export function useFormatters() {
  const locale = useLocale();
  const format = useFormatter();
  return {
    locale,
    num: (value: number) => format.number(value),
    date: (value: Date | string | number) =>
      new Intl.DateTimeFormat(intlTag(locale), { dateStyle: "medium" }).format(new Date(value)),
  };
}
