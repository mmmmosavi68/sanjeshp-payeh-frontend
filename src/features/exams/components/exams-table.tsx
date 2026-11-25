"use client";

import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { IconButton } from "@/components/shared/icon-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/permissions/use-permission";
import { useFormatters } from "@/lib/format";

import type { ExamDto } from "../types";

type ExamsTableProps = {
  rows: ExamDto[] | undefined;
  loading: boolean;
  failed: boolean;
  toolbar: React.ReactNode;
  search: { value: string; onChange: (value: string) => void };
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (exam: ExamDto) => void;
  onDelete: (exam: ExamDto) => void;
};

export function ExamsTable({ rows, loading, failed, toolbar, search, onRetry, onCreate, onEdit, onDelete }: ExamsTableProps) {
  const tl = useTranslations("screens.exams.page");
  const { date } = useFormatters();

  const columns: DataTableColumn<ExamDto>[] = [
    { id: "title", header: tl("examTitle"), sortValue: (e) => e.title, cell: (e) => <span className="font-medium">{e.title}</span> },
    { id: "session", header: tl("session"), sortValue: (e) => e.examSessionTitle, cell: (e) => e.examSessionTitle || "—" },
    { id: "type", header: tl("examType"), hideOnMobile: true, sortValue: (e) => e.examTypeTitle, cell: (e) => e.examTypeTitle || "—" },
    { id: "mode", header: tl("deliveryMode"), hideOnMobile: true, sortValue: (e) => e.examModeTitle, cell: (e) => e.examModeTitle || "—" },
    { id: "start", header: tl("registrationStart"), hideOnMobile: true, sortValue: (e) => e.registrationStartDate, cell: (e) => date(e.registrationStartDate) },
    { id: "end", header: tl("registrationEnd"), hideOnMobile: true, sortValue: (e) => e.registrationEndDate, cell: (e) => date(e.registrationEndDate) },
    { id: "status", header: tl("status"), cell: (e) => <StatusBadge active={e.isActive} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(e) => e.id}
      caption={tl("examManagement")}
      loading={loading}
      failed={failed}
      errorTitle={tl("couldnTLoadTheExams")}
      errorDescription={tl("couldnTReachTheServer")}
      onRetry={onRetry}
      serverSearch={search}
      searchPlaceholder={tl("searchByTitle")}
      toolbar={toolbar}
      empty={{
        icon: <ClipboardList className="size-5" aria-hidden />,
        title: tl("noExamsYet"),
        description: tl("defineANewExamTo"),
        action: (
          <Can controller="Exams" action="Create">
            <Button onClick={onCreate}>
              <Plus className="size-4" aria-hidden />
              {tl("defineNewExam")}
            </Button>
          </Can>
        ),
      }}
      actions={(exam) => (
        <>
          <Can controller="Exams" action="Update">
            <IconButton label={tl("edit")} icon={<Pencil className="size-4" aria-hidden />} onClick={() => onEdit(exam)} />
          </Can>
          <Can controller="Exams" action="Delete">
            <IconButton label={tl("delete")} icon={<Trash2 className="size-4 text-destructive" aria-hidden />} onClick={() => onDelete(exam)} />
          </Can>
        </>
      )}
    />
  );
}
