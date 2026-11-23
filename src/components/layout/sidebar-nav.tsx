"use client";

import { Activity, LayoutDashboard } from "lucide-react";
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
      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 animate-pulse rounded bg-muted" />
      <div className="h-8 animate-pulse rounded bg-muted" />
      <div className="h-8 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function SidebarNav({ collapsed = false, onNavigate, badges = {} }: SidebarNavProps) {
  const t = useTranslations("nav");
  const menu = useSidebarMenu(onNavigate);
  const { locale, pathname, search, filteredMenus, failed, handleNavigate } = menu;

  if (menu.loading) return <SidebarSkeleton />;

  const hasShortcuts = menu.favoriteMenus.length > 0 || menu.recentMenus.length > 0;

  return (
    <>
      <nav aria-label={t("label")} className="flex min-w-0 flex-col gap-1 px-1.5 md:px-2">
        <Link
          href="/dashboard"
          onClick={handleNavigate}
          title={collapsed ? "Dashboard" : undefined}
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          className={cn(
            "flex h-(--density-control) min-w-0 items-center gap-2.5 rounded-md border px-2.5 text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            collapsed && "justify-center px-0",
            pathname === "/dashboard"
              ? "border-border/70 bg-accent font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:bg-accent/70 hover:text-foreground",
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" aria-hidden />
          <span className={cn("truncate", collapsed && "sr-only")}>
            {locale === "fa" ? "داشبورد" : "Dashboard"}
          </span>
        </Link>

        {!collapsed && (
          <SidebarSearch
            locale={locale}
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
          <p className="px-3 py-3 text-center text-xs text-muted-foreground">
            {locale === "fa" ? "منویی با این عنوان پیدا نشد." : "No matching menu found."}
          </p>
        )}

        {failed && !collapsed && (
          <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-muted-foreground">
            <p>
              {locale === "fa"
                ? "دریافت منوها از سرور ناموفق بود."
                : "Failed to load menus from server."}
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 font-medium text-primary underline"
              onClick={menu.reload}
            >
              <Activity className="size-3" />
              {t("retry")}
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
