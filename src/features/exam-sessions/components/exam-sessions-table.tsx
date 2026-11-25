"use client";

import { CalendarClock, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { IconButton } from "@/components/shared/icon-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Can } from "@/features/permissions/use-permission";
import { intlTag } from "@/lib/format";

import type { ExamSessionDto } from "../types";

type ExamSessionsTableProps = {
  examSessions: ExamSessionDto[];
  onEdit: (item: ExamSessionDto) => void;
  onDelete: (item: ExamSessionDto) => void;
};

/** Date-only API value ("2026-01-31T…") → localized date (Jalali for fa, Gregorian for en). */
function formatExamDate(value: string, locale: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "—";
  return new Intl.DateTimeFormat(intlTag(locale)).format(new Date(year, month - 1, day));
}

const formatTime = (value: string) => value.slice(0, 5);

export function ExamSessionsTable({ examSessions, onEdit, onDelete }: ExamSessionsTableProps) {
  const tl = useTranslations("screens.examSessions.examSessionsTable");
  const locale = useLocale();

  const columns: DataTableColumn<ExamSessionDto>[] = [
    { id: "title", header: tl("sessionTitle"), sortValue: (s) => s.title, cell: (s) => <span className="font-medium">{s.title}</span> },
    { id: "date", header: tl("examDate"), className: "tabular-nums", sortValue: (s) => s.examDate, cell: (s) => formatExamDate(s.examDate, locale) },
    { id: "start", header: tl("startTime"), hideOnMobile: true, className: "tabular-nums", sortValue: (s) => s.startTime, cell: (s) => <span dir="ltr">{formatTime(s.startTime)}</span> },
    { id: "end", header: tl("endTime"), hideOnMobile: true, className: "tabular-nums", sortValue: (s) => s.endTime, cell: (s) => <span dir="ltr">{formatTime(s.endTime)}</span> },
    { id: "status", header: tl("status"), cell: (s) => <StatusBadge active={s.isActive} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={examSessions}
      getRowId={(s) => s.id}
      caption={tl("sessionTitle")}
      empty={{ icon: <CalendarClock className="size-5" aria-hidden />, title: tl("sessionTitle"), description: "" }}
      actions={(item) => (
        <>
          <Can controller="ExamSessions" action="Update">
            <IconButton label={tl("edit")} icon={<Pencil className="size-4" aria-hidden />} onClick={() => onEdit(item)} />
          </Can>
          <Can controller="ExamSessions" action="Delete">
            <IconButton label={tl("delete")} icon={<Trash2 className="size-4 text-destructive" aria-hidden />} onClick={() => onDelete(item)} />
          </Can>
        </>
      )}
    />
  );
}
