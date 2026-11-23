"use client";

import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { PaletteSwitcher } from "@/components/shared/palette-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Brand } from "./brand";
import { UserMenu } from "./user-menu";

type AppHeaderProps = {
  dir: "rtl" | "ltr";
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onOpenMobile: () => void;
};

export function AppHeader({
  dir,
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onOpenMobile,
}: AppHeaderProps) {
  const t = useTranslations("common");
  // در RTL آیکن پنل باید به سمت راست (ابتدای خط) اشاره کند.
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header
      className={cn(
        "fixed end-0 top-0 z-30 flex h-(--header-h) items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl transition-[inset-inline-start] duration-200 ease-out start-0 md:px-4",
        collapsed ? "md:start-(--sidebar-w-collapsed)" : "md:start-(--sidebar-w)",
      )}
    >
      <Button
        variant="ghost"
        size="icon-lg"
        className="size-11 md:hidden"
        aria-label={t("openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        onClick={onOpenMobile}
      >
        <Menu className="size-5" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        className="hidden md:inline-flex"
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        aria-expanded={!collapsed}
        aria-controls="desktop-sidebar"
        onClick={onToggleCollapsed}
      >
        <CollapseIcon className="size-4 rtl:-scale-x-100" aria-hidden />
      </Button>

      {/* در موبایل نشان سامانه در هدر دیده می‌شود؛ در دسکتاپ داخل سایدبار است. */}
      <Brand className="md:hidden max-sm:[&>span]:sr-only" />

      <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
        <LocaleSwitcher />
        <PaletteSwitcher />
        <ThemeToggle />
        <UserMenu dir={dir} />
      </div>
    </header>
  );
}
