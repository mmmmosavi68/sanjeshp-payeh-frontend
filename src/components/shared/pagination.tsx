"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useFormatters } from "@/lib/format";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ page, pageSize, total, onPageChange, disabled }: PaginationProps) {
  const t = useTranslations("common.pagination");
  const { num } = useFormatters();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label={t("label")} className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
      <p aria-live="polite">{t("range", { from: num(from), to: num(to), total: num(total) })}</p>
      <div className="flex items-center gap-2">
        <span>{t("pageOf", { page: num(page), pages: num(pages) })}</span>
        <Button type="button" variant="outline" size="icon-sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)} aria-label={t("previous")}>
          <ChevronRight className="size-4 ltr:rotate-180" aria-hidden />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" disabled={disabled || page >= pages} onClick={() => onPageChange(page + 1)} aria-label={t("next")}>
          <ChevronLeft className="size-4 ltr:rotate-180" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
