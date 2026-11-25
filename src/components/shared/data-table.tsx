"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { matchesSearch } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";

import { EmptyState, ErrorState } from "./data-states";
import { LoadingState } from "./loading-state";
import { Pagination } from "./pagination";
import { SearchInput } from "./search-input";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Enables client-side sorting on this column. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "start" | "center" | "end";
  className?: string;
  /** Hidden below the `md` breakpoint. */
  hideOnMobile?: boolean;
};

export type DataTableEmpty = { icon: ReactNode; title: string; description: string; action?: ReactNode };

export type ServerPagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

type DataTableProps<T> = {
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: ReadonlyArray<T> | undefined;
  getRowId: (row: T) => string | number;
  /** Accessible table name. */
  caption: string;
  loading?: boolean;
  /** Truthy when loading failed. */
  failed?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  empty: DataTableEmpty;
  /** Per-row actions (rendered in the last, uniformly styled column). */
  actions?: (row: T) => ReactNode;
  /** Client-side search over `searchText(row)`; use `serverSearch` for server-side. */
  searchText?: (row: T) => Array<string | number | null | undefined>;
  serverSearch?: { value: string; onChange: (value: string) => void };
  searchPlaceholder?: string;
  /** Filters / extra buttons placed beside the search box. */
  toolbar?: ReactNode;
  /** Client-side page size (default 10). Ignored when `serverPagination` is set. */
  pageSize?: number;
  serverPagination?: ServerPagination;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
};

const ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  loading = false,
  failed = false,
  errorTitle,
  errorDescription,
  onRetry,
  empty,
  actions,
  searchText,
  serverSearch,
  searchPlaceholder,
  toolbar,
  pageSize = 10,
  serverPagination,
  rowClassName,
  className,
}: DataTableProps<T>) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [clientSearch, setClientSearch] = useState("");
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [clientPage, setClientPage] = useState(1);

  const query = serverSearch ? serverSearch.value : clientSearch;

  const processed = useMemo(() => {
    let list = [...(rows ?? [])];
    if (!serverSearch && searchText && clientSearch.trim()) {
      list = list.filter((row) => matchesSearch(clientSearch, ...searchText(row)));
    }
    const column = sort ? columns.find((c) => c.id === sort.id) : undefined;
    if (sort && column?.sortValue) {
      const collator = new Intl.Collator(locale, { numeric: true });
      const get = column.sortValue;
      const factor = sort.dir === "asc" ? 1 : -1;
      list.sort((a, b) => {
        const x = get(a) ?? "";
        const y = get(b) ?? "";
        return typeof x === "number" && typeof y === "number" ? (x - y) * factor : collator.compare(String(x), String(y)) * factor;
      });
    }
    return list;
  }, [rows, serverSearch, searchText, clientSearch, sort, columns, locale]);

  const total = serverPagination ? serverPagination.total : processed.length;
  const size = serverPagination ? serverPagination.pageSize : pageSize;
  const lastPage = Math.max(1, Math.ceil(total / size));
  const page = serverPagination ? serverPagination.page : Math.min(clientPage, lastPage);
  const visible = serverPagination ? processed : processed.slice((page - 1) * size, page * size);
  const showPagination = total > size || (serverPagination !== undefined && total > 0);
  const hasToolbar = Boolean(searchText || serverSearch || toolbar);

  function toggleSort(id: string) {
    setSort((current) => (current?.id !== id ? { id, dir: "asc" } : current.dir === "asc" ? { id, dir: "desc" } : null));
    setClientPage(1);
  }

  function renderBody(): ReactNode {
    if (loading && !rows) return <LoadingState />;
    if (failed) {
      return (
        <div className="p-4">
          <ErrorState title={errorTitle ?? t("loadFailed")} description={errorDescription ?? t("loadFailedDescription")} onRetry={onRetry ?? (() => undefined)} />
        </div>
      );
    }
    if ((rows?.length ?? 0) === 0) return <div className="p-4"><EmptyState {...empty} /></div>;
    if (processed.length === 0) {
      return <p className="px-4 py-8 text-center text-sm text-muted-foreground" role="status">{t("noSearchResults")}</p>;
    }

    return (
      <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-60")} aria-busy={loading || undefined}>
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => {
                const sorted = sort?.id === col.id ? sort.dir : null;
                return (
                  <TableHead
                    key={col.id}
                    scope="col"
                    aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("text-xs font-medium text-muted-foreground", ALIGN[col.align ?? "start"], col.hideOnMobile && "hidden md:table-cell", col.className)}
                  >
                    {col.sortValue ? (
                      <button type="button" onClick={() => toggleSort(col.id)} className="inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">
                        {col.header}
                        {sorted === "asc" ? <ArrowUp className="size-3" aria-hidden /> : sorted === "desc" ? <ArrowDown className="size-3" aria-hidden /> : <ChevronsUpDown className="size-3 opacity-50" aria-hidden />}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
              {actions ? <TableHead scope="col" className="w-24 text-center text-xs font-medium text-muted-foreground">{t("actions")}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={getRowId(row)} className={rowClassName?.(row)}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={cn(ALIGN[col.align ?? "start"], col.hideOnMobile && "hidden md:table-cell", col.className)}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {actions ? <TableCell className="text-center"><div className="flex items-center justify-center gap-1">{actions(row)}</div></TableCell> : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <section className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      {hasToolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          {serverSearch ? (
            <SearchInput value={query} onChange={serverSearch.onChange} placeholder={searchPlaceholder ?? t("search")} />
          ) : searchText ? (
            <SearchInput
              value={clientSearch}
              onChange={(v) => {
                setClientSearch(v);
                setClientPage(1);
              }}
              placeholder={searchPlaceholder ?? t("search")}
            />
          ) : null}
          {toolbar ? <div className="flex flex-wrap items-center gap-2 sm:ms-auto">{toolbar}</div> : null}
        </div>
      ) : null}
      {renderBody()}
      {showPagination && !failed && processed.length > 0 ? (
        <Pagination
          page={page}
          pageSize={size}
          total={total}
          disabled={loading}
          onPageChange={serverPagination ? serverPagination.onPageChange : setClientPage}
        />
      ) : null}
    </section>
  );
}
