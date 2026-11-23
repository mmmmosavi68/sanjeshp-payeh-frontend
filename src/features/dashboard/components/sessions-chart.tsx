"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { localeDirections } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type SessionsChartProps = {
  /** ISO تاریخ ایجاد نشست‌ها */
  createdAt: string[];
  days?: number;
};

/** شروع روز محلی */
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * نمودار میله‌ای سبک (بدون کتابخانه‌ی نمودار) — با flex ساخته شده تا
 * جهت RTL/LTR، ریسپانسیو‌بودن و تم به‌طور طبیعی کار کند.
 */
export function SessionsChart({ createdAt, days = 7 }: SessionsChartProps) {
  const t = useTranslations("dashboard.v2.chart");
  const format = useFormatter();
  const locale = useLocale();
  const dir = localeDirections[locale] ?? "ltr";

  const buckets = useMemo(() => {
    const today = startOfDay(new Date());
    const list = Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - index));
      return { date, count: 0 };
    });
    for (const iso of createdAt) {
      const day = startOfDay(new Date(iso)).getTime();
      const bucket = list.find((item) => item.date.getTime() === day);
      if (bucket) bucket.count += 1;
    }
    return list;
  }, [createdAt, days]);

  const max = Math.max(1, ...buckets.map((item) => item.count));
  const total = buckets.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="grid h-52 place-items-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  return (
    <div dir={dir}>
      {/* خلاصه برای صفحه‌خوان‌ها */}
      <ul className="sr-only">
        {buckets.map((item) => (
          <li key={item.date.toISOString()}>
            {format.dateTime(item.date, { weekday: "long" })}: {t("sessionsCount", { count: item.count })}
          </li>
        ))}
      </ul>

      <div aria-hidden className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">
        {buckets.map((item, index) => {
          const isToday = index === buckets.length - 1;
          const height = Math.max(item.count === 0 ? 3 : 8, (item.count / max) * 100);
          return (
            <div key={item.date.toISOString()} className="group flex h-full flex-col items-center justify-end gap-1.5">
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  item.count === 0 ? "text-muted-foreground/60" : "text-foreground",
                )}
              >
                {format.number(item.count)}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full origin-bottom animate-grow-y rounded-t-lg transition-opacity",
                    item.count === 0
                      ? "bg-muted"
                      : isToday
                        ? "bg-primary"
                        : "bg-primary/45 group-hover:bg-primary/70",
                  )}
                  style={{ height: `${height}%`, animationDelay: `${index * 40}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="mt-2 grid grid-cols-7 gap-2 border-t pt-2 sm:gap-4">
        {buckets.map((item) => (
          <span key={item.date.toISOString()} className="truncate text-center text-xs text-muted-foreground">
            {format.dateTime(item.date, { weekday: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}
