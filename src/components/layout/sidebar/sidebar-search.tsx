"use client";

import { Command, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

type SidebarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onOpenQuickSearch: () => void;
};

export function SidebarSearch({ value, onChange, onOpenQuickSearch }: SidebarSearchProps) {
  const t = useTranslations("shell.sidebar");

  return (
    <div className="relative my-2 min-w-0">
      <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className="h-(--density-control) w-full min-w-0 rounded-md border border-input bg-background ps-8 pe-[4.5rem] text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      />

      <button
        type="button"
        onClick={onOpenQuickSearch}
        title="Ctrl + K"
        aria-label={t("quickSearch")}
        className="absolute end-8 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Command className="size-3.5" />
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("clearSearch")}
          className="absolute end-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded hover:bg-accent"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
