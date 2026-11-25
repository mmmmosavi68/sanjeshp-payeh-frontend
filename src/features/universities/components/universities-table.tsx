"use client";

import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { IconButton } from "@/components/shared/icon-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/permissions/use-permission";
import { useFormatters } from "@/lib/format";

import type { UniversityDto } from "../types";

type Props = {
  rows: UniversityDto[] | undefined;
  loading: boolean;
  failed: boolean;
  toolbar: ReactNode;
  search: { value: string; onChange: (value: string) => void };
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (university: UniversityDto) => void;
  onDelete: (university: UniversityDto) => void;
};

export function UniversitiesTable({ rows, loading, failed, toolbar, search, onRetry, onCreate, onEdit, onDelete }: Props) {
  const tl = useTranslations("screens.universities.page");
  const tt = useTranslations("screens.universities.universitiesTable");
  const { num } = useFormatters();

  const columns: DataTableColumn<UniversityDto>[] = [
    { id: "title", header: tt("universityName"), sortValue: (u) => u.title, cell: (u) => <span className="font-medium">{u.title}</span> },
    { id: "type", header: tt("universityType"), hideOnMobile: true, sortValue: (u) => u.universityTypeTitle, cell: (u) => u.universityTypeTitle || "—" },
    { id: "region", header: tt("region"), hideOnMobile: true, sortValue: (u) => u.region, cell: (u) => `${tt("region")} ${num(u.region)}` },
    { id: "capacity", header: tt("approvedCapacity"), hideOnMobile: true, sortValue: (u) => u.capacityApproved, cell: (u) => num(u.capacityApproved) },
    { id: "parent", header: tt("parentUniversity"), hideOnMobile: true, sortValue: (u) => u.parentUniversityTitle, cell: (u) => u.parentUniversityTitle || "—" },
    { id: "status", header: tt("status"), cell: (u) => <StatusBadge active={u.isActive} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(u) => u.id}
      caption={tl("universityManagement")}
      loading={loading}
      failed={failed}
      errorTitle={tl("couldnTLoadTheUniversities")}
      errorDescription={tl("couldnTReachTheServer")}
      onRetry={onRetry}
      serverSearch={search}
      searchPlaceholder={tl("searchByUniversityName")}
      toolbar={toolbar}
      empty={{
        icon: <Building2 className="size-5" aria-hidden />,
        title: tl("noUniversitiesFound"),
        description: tl("noUniversitiesMatchTheCurrent"),
        action: (
          <Can controller="Universities" action="Create">
            <Button onClick={onCreate}>
              <Plus className="size-4" aria-hidden />
              {tl("addNewUniversity")}
            </Button>
          </Can>
        ),
      }}
      actions={(u) => (
        <>
          <Can controller="Universities" action="Update">
            <IconButton label={tt("edit")} icon={<Pencil className="size-4" aria-hidden />} onClick={() => onEdit(u)} />
          </Can>
          <Can controller="Universities" action="Delete">
            <IconButton label={tt("delete")} icon={<Trash2 className="size-4 text-destructive" aria-hidden />} onClick={() => onDelete(u)} />
          </Can>
        </>
      )}
    />
  );
}
