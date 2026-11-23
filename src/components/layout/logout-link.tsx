"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { useLogout } from "@/features/auth/use-logout";
import { cn } from "@/lib/utils";

type LogoutLinkProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function LogoutLink({ collapsed = false, onNavigate }: LogoutLinkProps) {
  const t = useTranslations("common");
  const handleLogout = useLogout();

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        void handleLogout();
      }}
      title={collapsed ? t("logout") : undefined}
      aria-label={collapsed ? t("logout") : undefined}
      className="flex h-(--density-control) w-full items-center gap-2.5 rounded-md px-2.5 text-start text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      <span className={cn("truncate", collapsed && "sr-only")}>{t("logout")}</span>
    </button>
  );
}
