"use client";

import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { QuickSearchDialog } from "./sidebar/quick-search-dialog";
import { SidebarNodes } from "./sidebar/sidebar-nodes";
import { SidebarSearch } from "./sidebar/sidebar-search";
import { ShortcutSections } from "./sidebar/sidebar-shortcuts";
import { useSidebarMenu } from "./sidebar/use-sidebar-menu";

type SidebarNavProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  badges?: Record<string, number>;
};

function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-3 py-2" aria-busy="true">
      <div className="h-9 animate-pulse rounded-lg bg-muted" />
      <div className="h-9 animate-pulse rounded-lg bg-muted" />
      <div className="h-9 animate-pulse rounded-lg bg-muted" />
      <div className="h-9 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export function SidebarNav({ collapsed = false, onNavigate, badges = {} }: SidebarNavProps) {
  const t = useTranslations("shell.sidebar");
  const tn = useTranslations("nav");
  const menu = useSidebarMenu(onNavigate);
  const { locale, pathname, search, filteredMenus, failed, handleNavigate } = menu;

  if (menu.loading) return <SidebarSkeleton />;

  const hasShortcuts = menu.favoriteMenus.length > 0 || menu.recentMenus.length > 0;
  const dashboardActive = pathname === "/dashboard";

  return (
    <>
      <nav aria-label={tn("label")} className="flex min-w-0 flex-col gap-1 px-2">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          title={collapsed ? t("dashboard") : undefined}
          aria-current={dashboardActive ? "page" : undefined}
          className={cn(
            "relative flex min-h-(--density-control) min-w-0 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            collapsed && "justify-center px-0",
            dashboardActive
              ? "bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full before:bg-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" aria-hidden />
          <span className={cn("truncate", collapsed && "sr-only")}>{t("dashboard")}</span>
        </Link>

        {!collapsed && (
          <SidebarSearch
            value={search}
            onChange={menu.setSearch}
            onOpenQuickSearch={() => {
              menu.setQuickSearchOpen(true);
              menu.setQuickSearch("");
            }}
          />
        )}

        {!collapsed && (
          <ShortcutSections
            locale={locale}
            pathname={pathname}
            favoriteMenus={menu.favoriteMenus}
            recentMenus={menu.recentMenus}
            badges={badges}
            onNavigate={handleNavigate}
          />
        )}

        {hasShortcuts && !collapsed && <div className="my-1 border-t border-border/60" />}

        <div className="min-w-0 space-y-1">
          <SidebarNodes nodes={filteredMenus} collapsed={collapsed} badges={badges} menu={menu} />
        </div>

        {search && filteredMenus.length === 0 && (
          <p className="px-3 py-3 text-center text-xs text-muted-foreground">{t("noMenuMatch")}</p>
        )}

        {failed && !collapsed && (
          <div
            role="alert"
            className="mt-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground/80"
          >
            <p>{t("loadFailed")}</p>
            <button
              type="button"
              className="mt-2 inline-flex min-h-8 items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
              onClick={menu.reload}
            >
              <RefreshCw className="size-3" aria-hidden />
              {tn("retry")}
            </button>
          </div>
        )}
      </nav>

      {menu.quickSearchOpen && (
        <QuickSearchDialog
          locale={locale}
          query={menu.quickSearch}
          results={menu.quickSearchResults}
          badges={badges}
          onQueryChange={menu.setQuickSearch}
          onClose={() => menu.setQuickSearchOpen(false)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
