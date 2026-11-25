"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ExamFormSheet } from "@/features/exams/components/exam-form-sheet";
import { ExamsFilters } from "@/features/exams/components/exams-filters";
import { ExamsTable } from "@/features/exams/components/exams-table";
import { useExamsPage } from "@/features/exams/hooks/use-exams-page";
import { Can } from "@/features/permissions/use-permission";

export default function ExamsPage() {
  const tl = useTranslations("screens.exams.page");
  const page = useExamsPage();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={tl("examManagement")} description={tl("defineAndManageExamsTheir")} />
        <Can controller="Exams" action="Create">
          <Button onClick={page.openCreate}>
            <Plus className="size-4" aria-hidden />
            {tl("defineNewExam")}
          </Button>
        </Can>
      </div>

      <ExamsTable
        rows={page.exams.data}
        loading={page.exams.loading}
        failed={page.exams.failed}
        onRetry={page.exams.reload}
        search={{ value: page.filters.search ?? "", onChange: page.setSearch }}
        toolbar={<ExamsFilters filters={page.filters} sessions={page.sessions} hasFilters={page.hasFilters} onChange={page.patchFilters} onClear={page.clearFilters} />}
        onCreate={page.openCreate}
        onEdit={page.openEdit}
        onDelete={page.setDeleteTarget}
      />

      <ExamFormSheet
        open={page.formOpen}
        onOpenChange={page.setFormOpen}
        exam={page.editingExam}
        sessions={page.sessions}
        onSaved={page.exams.reload}
      />

      <ConfirmDialog
        open={page.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) page.setDeleteTarget(null);
        }}
        title={tl("deleteExam")}
        description={page.deleteTarget ? tl("areYouSureYouWant", { p0: page.deleteTarget.title }) : ""}
        confirmLabel={tl("deleteExam")}
        onConfirm={page.confirmDelete}
      />
    </div>
  );
}
