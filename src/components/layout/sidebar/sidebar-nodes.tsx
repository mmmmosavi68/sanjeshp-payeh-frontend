"use client";

import { ChevronDown, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { MenuBadge } from "./menu-badge";
import { iconFor } from "./menu-icons";
import { hasActiveChild, isActivePath, isValidLink, type MenuNode } from "./menu-tree";
import { MAX_FAVORITES } from "./sidebar-storage";
import type { SidebarMenuState } from "./use-sidebar-menu";

export type SidebarNodesProps = {
  nodes: MenuNode[];
  depth?: number;
  collapsed: boolean;
  badges: Record<string, number>;
  menu: SidebarMenuState;
};

/** درخت بازگشتیِ منو (گره‌های والد، لینک‌ها و دکمه‌ی علاقه‌مندی). */
export function SidebarNodes(props: SidebarNodesProps) {
  const { nodes, depth = 0, collapsed, badges, menu } = props;
  const t = useTranslations("shell.sidebar");
  const {
    pathname,
    search,
    expandedItems,
    favoriteIds,
    toggleExpanded,
    toggleFavorite,
    handleNavigate,
  } = menu;

  return (
    <>
      {nodes.map((node, index) => {
      const Icon = iconFor(node.icon);

      const hasChildren = node.children.length > 0;
      const active = isActivePath(pathname, node.link);
      const childActive = hasActiveChild(node, pathname);

      const expanded =
        search.trim().length > 0 ||
        (expandedItems[node.id] ?? childActive);

      const label = node.menuTitle;
      const selected = active || childActive;

      const hasValidLink = isValidLink(node.link);

      const canFavorite = !hasChildren && hasValidLink;
      const isFavorite = favoriteIds.includes(node.id);
      const favoriteLimitReached =
        favoriteIds.length >= MAX_FAVORITES && !isFavorite;

      const iconClass = cn(
        "size-4 shrink-0 transition-colors duration-150",
        selected
          ? hasChildren ? "text-foreground" : "text-primary"
          : "text-muted-foreground/80",
      );

      const rowClass = cn(
        "relative flex min-h-(--density-control) w-full min-w-0 items-center gap-2.5 rounded-lg text-sm",
        collapsed && "justify-center px-0",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "hover:bg-accent hover:text-foreground",
        selected
          ? hasChildren
            ? "font-medium text-foreground"
            : "bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full before:bg-primary"
          : "text-muted-foreground",
      );

      return (
        <div
          key={node.id}
          className={cn(
            "w-full min-w-0",
            depth === 0 &&
              index < nodes.length - 1 &&
              "border-b border-border/50 pb-2",
          )}
        >
          <div className="flex w-full min-w-0 items-center gap-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpanded(node.id)}
                title={collapsed ? label : undefined}
                aria-label={label}
                aria-expanded={expanded}
                className={cn(
                  rowClass,
                  "min-w-0 flex-1 px-2.5",
                )}
              >
                <Icon className={iconClass} aria-hidden />

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-start",
                    collapsed && "sr-only",
                  )}
                >
                  {label}
                </span>

                <MenuBadge count={badges[node.id]} />

                {!collapsed && (
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 ms-1 transition-transform duration-200 ease-in-out",
                      expanded
                        ? "rotate-0"
                        : "rtl:rotate-90 ltr:-rotate-90",
                    )}
                  />
                )}
              </button>
            ) : hasValidLink ? (
              <Link
                href={node.link!}
                onClick={handleNavigate}
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  rowClass,
                  "min-w-0 flex-1 px-2.5",
                )}
              >
                <Icon className={iconClass} aria-hidden />

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-start",
                    collapsed && "sr-only",
                  )}
                >
                  {label}
                </span>

                <MenuBadge count={badges[node.id]} />
              </Link>
            ) : (
              <div
                className={cn(
                  rowClass,
                  "min-w-0 flex-1 px-2.5 opacity-60",
                )}
              >
                <Icon className={iconClass} aria-hidden />

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-start",
                    collapsed && "sr-only",
                  )}
                >
                  {label}
                </span>

                <MenuBadge count={badges[node.id]} />
              </div>
            )}

            {canFavorite && (
              <button
                type="button"
                disabled={favoriteLimitReached}
                onClick={() => toggleFavorite(node.id)}
                title={
                  favoriteLimitReached
                    ? t("favoriteLimit")
                    : isFavorite
                      ? t("removeFavorite")
                      : t("addFavorite")
                }
                aria-label={
                  isFavorite
                    ? t("removeFavoriteNamed", { label })
                    : t("addFavoriteNamed", { label })
                }
                aria-pressed={isFavorite}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors cursor-pointer",
                  "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  isFavorite
                    ? "text-amber-500"
                    : "text-muted-foreground/50 hover:text-amber-500",
                  favoriteLimitReached &&
                    "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-muted-foreground/50",
                )}
              >
                <Star
                  className={cn(
                    "size-4",
                    isFavorite && "fill-current",
                  )}
                />
              </button>
            )}
          </div>

          {hasChildren && (
            <div
              aria-hidden={!expanded}
              className={cn(
                "grid min-w-0 transition-[grid-template-rows,opacity,margin] duration-200 ease-in-out",
                expanded
                  ? "grid-rows-[1fr] opacity-100 mt-1"
                  : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none",
              )}
            >
              <div className="min-h-0 min-w-0 overflow-hidden">
                <div
                  className={cn(
                    "min-w-0 space-y-1",
                    !collapsed &&
                      "ms-3 border-s border-border ps-3",
                  )}
                >
                  <SidebarNodes {...props} nodes={node.children} depth={depth + 1} />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    })}
    </>
  );
}
