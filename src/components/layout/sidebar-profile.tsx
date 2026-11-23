"use client";

import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/features/auth/me";
import { useLogout } from "@/features/auth/use-logout";
import { useRemoteData } from "@/hooks/use-remote-data";
import { cn } from "@/lib/utils";

import { displayName, initialsOf } from "./user-identity";

type SidebarProfileProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

/** کارت پروفایل کاربر + دکمه‌ی خروج، پایین سایدبار. */
export function SidebarProfile({ collapsed = false, onNavigate }: SidebarProfileProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const handleLogout = useLogout();
  const { data: me } = useRemoteData("me", getMe);

  const role = me?.roles[0] ? (locale === "fa" ? me.roles[0].nameFa : me.roles[0].nameEn) : "";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-muted/40 p-2",
        collapsed && "flex-col border-transparent bg-transparent p-0",
      )}
    >
      <div className={cn("flex min-w-0 flex-1 items-center gap-2.5", collapsed && "flex-none")}>
        {me ? (
          <span
            title={collapsed ? displayName(me) : undefined}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {initialsOf(me)}
          </span>
        ) : (
          <Skeleton className="size-9 shrink-0 rounded-full" />
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            {me ? (
              <>
                <p className="truncate text-sm font-semibold leading-5">{displayName(me)}</p>
                {role ? <p className="truncate text-xs text-muted-foreground">{role}</p> : null}
              </>
            ) : (
              <>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-1.5 h-3 w-16" />
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void handleLogout();
        }}
        title={t("logout")}
        aria-label={t("logout")}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <LogOut className="size-4 rtl:-scale-x-100" aria-hidden />
      </button>
    </div>
  );
}
