"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { PaletteSwitcher } from "@/components/shared/palette-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

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

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-(--header-h) items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={t("openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        onClick={onOpenMobile}
      >
        <Menu className="size-4" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        aria-expanded={!collapsed}
        aria-controls="desktop-sidebar"
        onClick={onToggleCollapsed}
      >
        <Menu className="size-4" aria-hidden />
      </Button>

      <Brand />

      <div className="ms-auto flex items-center gap-1">
        <LocaleSwitcher />
        <PaletteSwitcher />
        <ThemeToggle />
        <UserMenu dir={dir} />
      </div>
    </header>
  );
}
