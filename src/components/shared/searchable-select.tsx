"use client";

import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { matchesSearch } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";

export type SearchableOption<V extends string | number = string | number> = {
  value: V;
  label: string;
  /** Secondary text shown under the label (also searchable). */
  description?: string;
  /** Extra searchable text (codes, aliases…). */
  keywords?: Array<string | number | null | undefined>;
  disabled?: boolean;
};

export type SearchableSelectProps<V extends string | number> = {
  options: ReadonlyArray<SearchableOption<V>>;
  value: V | null | undefined;
  onChange: (value: V) => void;
  /** When provided, a clear button is shown while a value is selected. */
  onClear?: () => void;
  id?: string;
  name?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Error message (also marks the control as invalid). */
  error?: string;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * The one and only Select of the application: searchable (ی/ي, ک/ك and Persian/Arabic/Latin digits are
 * treated as equal), keyboard accessible (combobox/listbox ARIA) and direction-aware (logical CSS only).
 */
export function SearchableSelect<V extends string | number>({
  options,
  value,
  onChange,
  onClear,
  id,
  name,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
  loading = false,
  error,
  required,
  className,
  ...aria
}: SearchableSelectProps<V>) {
  const t = useTranslations("common.select");
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const isDisabled = disabled || loading;

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        matchesSearch(query, o.label, o.description, ...(o.keywords ?? [])),
      ),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    if (isDisabled) return;
    const idx = options.findIndex((o) => o.value === value);
    setQuery("");
    setActive(Math.max(idx, 0));
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function pick(option: SearchableOption<V>) {
    if (option.disabled) return;
    onChange(option.value);
    close();
  }

  function move(delta: number) {
    if (filtered.length === 0) return;
    let next = active;
    for (let i = 0; i < filtered.length; i++) {
      next = (next + delta + filtered.length) % filtered.length;
      if (!filtered[next].disabled) break;
    }
    setActive(next);
  }

  function onSearchKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        if (e.ctrlKey) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (e.ctrlKey) {
          e.preventDefault();
          setActive(Math.max(filtered.length - 1, 0));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[active]) pick(filtered[active]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // do not close a surrounding dialog/sheet
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  }

  function onTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  }

  const activeId = filtered[active] ? `${uid}-opt-${active}` : undefined;
  const showClear = Boolean(onClear) && selected !== null && !isDisabled;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-busy={loading || undefined}
          aria-label={aria["aria-label"]}
          aria-labelledby={aria["aria-labelledby"]}
          disabled={isDisabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-2.5 text-start text-sm outline-none transition-colors hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-destructive focus-visible:ring-destructive/30",
            showClear && "pe-14",
          )}
        >
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {loading
              ? t("loading")
              : (selected?.label ?? placeholder ?? t("placeholder"))}
          </span>
          {loading ? (
            <Loader2
              className="size-3.5 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : (
            <ChevronsUpDown
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
        </button>
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={t("clear")}
            className="absolute end-8 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={selected ? String(selected.value) : ""}
        />
      ) : null}

      {error ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {open ? (
        <div className="absolute start-0 top-full z-50 mt-1 w-full min-w-56 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="relative border-b p-1.5">
            <Search
              className="pointer-events-none absolute start-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              role="searchbox"
              aria-label={searchPlaceholder ?? t("searchPlaceholder")}
              aria-controls={listId}
              aria-activedescendant={activeId}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder ?? t("searchPlaceholder")}
              maxLength={100}
              autoComplete="off"
              className="h-7 w-full rounded-sm bg-transparent ps-7 pe-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {filtered.length === 0 ? (
            <p
              className="px-3 py-4 text-center text-xs text-muted-foreground"
              role="status"
            >
              {emptyText ?? t("empty")}
            </p>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1"
            >
              {filtered.map((o, i) => (
                <li
                  key={String(o.value)}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={o.value === value}
                  aria-disabled={o.disabled || undefined}
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm",
                    i === active && "bg-accent text-accent-foreground",
                    o.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{o.label}</span>
                    {o.description ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.description}
                      </span>
                    ) : null}
                  </span>
                  {o.value === value ? (
                    <Check
                      className="size-3.5 shrink-0 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
