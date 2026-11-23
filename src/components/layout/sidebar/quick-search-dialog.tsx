"use client";

import { Search, X } from "lucide-react";

import { Link } from "@/i18n/navigation";

import { MenuBadge } from "./menu-badge";
import { iconFor } from "./menu-icons";
import type { MenuNode } from "./menu-tree";

type QuickSearchDialogProps = {
  locale: string;
  query: string;
  results: MenuNode[];
  badges: Record<string, number>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onNavigate: () => void;
};

/** پنجره‌ی جستجوی سریع صفحات (Ctrl/⌘ + K). */
export function QuickSearchDialog({
  locale,
  query,
  results,
  badges,
  onQueryChange,
  onClose,
  onNavigate,
}: QuickSearchDialogProps) {
  const fa = locale === "fa";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[15vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={fa ? "جستجوی سریع صفحات" : "Quick page search"}
        className="w-full max-w-lg overflow-hidden rounded-lg border bg-popover shadow-lg"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={fa ? "نام صفحه موردنظر را جستجو کنید..." : "Search for a page..."}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={fa ? "بستن" : "Close"}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[min(55vh,420px)] overflow-y-auto p-1.5">
          {results.length > 0 ? (
            <div className="space-y-0.5">
              {results.map((node) => {
                const Icon = iconFor(node.icon);

                return (
                  <Link
                    key={node.id}
                    href={node.link!}
                    onClick={onNavigate}
                    className="flex min-h-(--density-control) items-center gap-2.5 rounded-md px-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{node.menuTitle}</span>
                    <MenuBadge count={badges[node.id]} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {fa ? "صفحه‌ای با این عنوان پیدا نشد." : "No matching page found."}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span>{fa ? "برای جستجو نام صفحه را وارد کنید" : "Type to search pages"}</span>
          <span className="rounded border px-1.5 py-0.5">ESC</span>
        </div>
      </div>
    </div>
  );
}
