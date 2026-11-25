"use client";

import { Database, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { IconButton } from "@/components/shared/icon-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useFormatters } from "@/lib/format";

import type { CodeDto } from "../types";

type Props = {
  items: CodeDto[];
  groupTitle: string;
  toolbar: ReactNode;
  onCreate: () => void;
  onEdit: (code: CodeDto) => void;
  onDelete: (code: CodeDto) => void;
};

export function CodesItemsTable({ items, groupTitle, toolbar, onCreate, onEdit, onDelete }: Props) {
  const tl = useTranslations("screens.codes.page");
  const { num } = useFormatters();
  const dash = "—";

  const columns: DataTableColumn<CodeDto>[] = [
    { id: "subCode", header: tl("columnSubCode"), align: "center", className: "w-20 tabular-nums", sortValue: (c) => c.subCode, cell: (c) => (c.subCode === null ? dash : num(c.subCode)) },
    { id: "title", header: tl("columnTitle"), sortValue: (c) => c.title, cell: (c) => <span className="font-medium">{c.title}</span> },
    { id: "standardCode", header: tl("columnStandardCode"), hideOnMobile: true, className: "tabular-nums", sortValue: (c) => c.standardCode, cell: (c) => (c.standardCode === null ? dash : num(c.standardCode)) },
    { id: "description", header: tl("columnDescription"), hideOnMobile: true, className: "max-w-xs text-muted-foreground", cell: (c) => <span className="block truncate">{c.additionalInformation || dash}</span> },
    { id: "status", header: tl("status"), align: "center", cell: (c) => <StatusBadge active={c.isActive} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowId={(c) => c.id}
      caption={groupTitle}
      searchText={(c) => [c.title, c.standardCode, c.subCode]}
      searchPlaceholder={tl("searchItems")}
      toolbar={toolbar}
      rowClassName={(c) => (c.isActive ? undefined : "opacity-60")}
      empty={{
        icon: <Database className="size-5" aria-hidden />,
        title: tl("noItemsInGroup"),
        description: groupTitle,
        action: (
          <Button size="sm" onClick={onCreate}>
            <Plus className="size-3.5" aria-hidden />
            {tl("addItem")}
          </Button>
        ),
      }}
      actions={(c) => (
        <>
          <IconButton label={tl("editTooltip")} icon={<Pencil className="size-3.5" aria-hidden />} onClick={() => onEdit(c)} />
          <IconButton label={tl("deleteTooltip")} icon={<Trash2 className="size-3.5 text-destructive" aria-hidden />} onClick={() => onDelete(c)} />
        </>
      )}
    />
  );
}
