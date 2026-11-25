"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useFormatters } from "@/lib/format";

export function CapacityUsage({
  used,
  approved,
}: {
  used: number;
  approved: number;
}) {
  const { num } = useFormatters();
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const free = approved - used;
  const over = free < 0;

  const pct =
    approved > 0 ? Math.min(100, (used / approved) * 100) : 0;

  return (
    <div className="w-full space-y-1 sm:min-w-56 sm:max-w-sm sm:flex-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {tl("electronicExamCapacity")}
        </span>

        <span className={cn("tabular-nums", over && "text-destructive")}>
          {num(used)} {tl("of")} {num(approved)}
        </span>
      </div>

      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={approved}
        aria-valuenow={used}
        aria-label={tl("approvedCapacityUtilization")}
      >
        <div
          className={cn(
            "transition-[width]",
            over ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />

        <div className={cn("flex-1", !over && "bg-primary/25")} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          {tl("filled")} <b className="tabular-nums">{num(used)}</b>
        </span>

        <span
          className={cn(
            "flex items-center gap-1.5",
            over && "text-destructive",
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              over ? "bg-destructive" : "bg-primary/25",
            )}
          />

          {over ? tl("overApproved") : tl("empty")}{" "}
          <b className="tabular-nums">{num(Math.abs(free))}</b>
        </span>
      </div>
    </div>
  );
}
