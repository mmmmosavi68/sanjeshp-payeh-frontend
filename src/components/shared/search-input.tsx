"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Accessible name; defaults to the placeholder. */
  label?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
};

/** Debounced search box — the single search behaviour for every table/toolbar. */
export function SearchInput({ value, onChange, placeholder, label, debounceMs = 300, disabled, className }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const lastEmitted = useRef(value);

  // Sync when the parent resets the value (e.g. "clear filters").
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === lastEmitted.current) return;
    const timer = setTimeout(() => {
      lastEmitted.current = draft;
      onChange(draft);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, debounceMs, onChange]);

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        maxLength={100}
        disabled={disabled}
        className="h-9 ps-8"
      />
    </div>
  );
}
