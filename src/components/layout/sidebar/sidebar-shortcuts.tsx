"use client";

import { Clock, Star } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { MenuBadge } from "./menu-badge";
import { MenuIcon } from "./menu-icons";
import { isActivePath, type MenuNode } from "./menu-tree";
import { MAX_FAVORITES } from "./sidebar-storage";

function SectionTitle({ icon, title, count }: { icon: ReactNode; title: string; count?: ReactNode }) {
  return (
    <div className="flex h-7 items-center gap-2 px-2">
      {icon}
      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{title}</span>
      {count !== undefined && (
        <span className="text-[10px] tabular-nums opacity-70">{count}</span>
      )}
    </div>
  );
}

type ShortcutLinkProps = {
  node: MenuNode;
  pathname: string;
  badge?: number;
  onNavigate: () => void;
};

function ShortcutLink({ node, pathname, badge, onNavigate }: ShortcutLinkProps) {
  return (
    <Link
      href={node.link!}
      onClick={onNavigate}
      className={cn(
        "flex min-h-(--density-control) min-w-0 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        isActivePath(pathname, node.link) && "bg-accent font-medium text-foreground",
      )}
    >
      <MenuIcon name={node.icon} className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-start">{node.menuTitle}</span>
      <MenuBadge count={badge} />
    </Link>
  );
}

type ShortcutListProps = Pick<ShortcutSectionsProps, "pathname" | "badges" | "onNavigate"> & {
  nodes: MenuNode[];
};

function ShortcutList({ nodes, pathname, badges, onNavigate }: ShortcutListProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <ShortcutLink
          key={node.id}
          node={node}
          pathname={pathname}
          badge={badges[node.id]}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

type ShortcutSectionsProps = {
  locale: string;
  pathname: string;
  favoriteMenus: MenuNode[];
  recentMenus: MenuNode[];
  badges: Record<string, number>;
  onNavigate: () => void;
};

/** بخش‌های «علاقه‌مندی‌ها» و «اخیراً بازدیدشده». */
export function ShortcutSections({
  locale,
  pathname,
  favoriteMenus,
  recentMenus,
  badges,
  onNavigate,
}: ShortcutSectionsProps) {
  const fa = locale === "fa";
  const listProps = { pathname, badges, onNavigate };

  return (
    <>
      {favoriteMenus.length > 0 && (
        <section className="mb-2 min-w-0 rounded-md border border-warning/25 bg-warning/[0.06] p-1.5">
          <SectionTitle
            icon={<Star className="size-3.5 text-warning" />}
            title={fa ? "علاقه‌مندی‌ها" : "Favorites"}
            count={`${favoriteMenus.length}/${MAX_FAVORITES}`}
          />
          <ShortcutList nodes={favoriteMenus} {...listProps} />
        </section>
      )}

      {recentMenus.length > 0 && (
        <section className="mb-2 min-w-0 rounded-md border border-info/25 bg-info/[0.06] p-1.5">
          <SectionTitle
            icon={<Clock className="size-3.5 text-info" />}
            title={fa ? "اخیراً بازدیدشده" : "Recently visited"}
            count={recentMenus.length}
          />
          <ShortcutList nodes={recentMenus} {...listProps} />
        </section>
      )}
    </>
  );
}
