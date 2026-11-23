"use client";

import { useState } from "react";
import { ClipboardList, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { FormField } from "@/components/shared/form-field";
import { useRemoteData } from "@/hooks/use-remote-data";
import { Can } from "@/features/permissions/use-permission";

import {
  deleteExam,
  listExams,
  listExamSessions,
} from "@/features/exams/api";

import { getExamOptions } from "@/features/exams/options";

import type {
  ExamDto,
  ExamFilters,
  ExamSessionOption,
} from "@/features/exams/types";

import { ExamFormSheet } from "@/features/exams/components/exam-form-sheet";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";

export default function ExamsPage() {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.exams.page");
  const [filters, setFilters] = useState<ExamFilters>({});
  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamDto | null>(null);

  const filterKey = JSON.stringify(filters);

  const {
    data: exams,
    loading,
    failed,
    reload,
  } = useRemoteData(
    `exams-${filterKey}`,
    () => listExams(filters),
  );

  const {
    data: sessions,
  } = useRemoteData<ExamSessionOption[]>(
    "exam-session-options",
    listExamSessions,
  );

  const {
    data: options,
  } = useRemoteData(
    "exam-code-options",
    getExamOptions,
  );

  function openCreate() {
    setEditingExam(null);
    setFormOpen(true);
  }

  function openEdit(exam: ExamDto) {
    setEditingExam(exam);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteExam(deleteTarget.id);
      toast.success(tl("examDeletedSuccessfully"));
      setDeleteTarget(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : tl("couldnTDeleteTheExam"),
      );
    }
  }

  function handleSaved() {
    reload();
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      search: searchText.trim() || undefined,
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {tl("examManagement")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tl("defineAndManageExamsTheir")}
          </p>
        </div>

        <Can controller="Exams" action="Create">
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {tl("defineNewExam")}
          </Button>
        </Can>
      </div>

      <section className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Search className="size-4 text-muted-foreground" />
          {tl("searchAndFilters")}
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FormField
            id="exam-search"
            label={tl("examTitle")}
            placeholder={tl("searchByTitle")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="exam-session-filter" className="text-sm font-medium">
              {tl("examSession")}
            </label>
            <select
              id="exam-session-filter"
              value={filters.examSessionId ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  examSessionId: event.target.value || undefined,
                }))
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">{tl("allSessions")}</option>
              {(sessions ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="exam-type-filter" className="text-sm font-medium">
              {tl("examType")}
            </label>
            <select
              id="exam-type-filter"
              value={filters.examTypeId ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  examTypeId: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">{tl("allTypes")}</option>
              {(options?.examTypes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="exam-status-filter" className="text-sm font-medium">
              {tl("status")}
            </label>
            <select
              id="exam-status-filter"
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                    ? "active"
                    : "inactive"
              }
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  isActive:
                    event.target.value === ""
                      ? undefined
                      : event.target.value === "active",
                }))
              }
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">{tl("allStatuses")}</option>
              <option value="active">{tl("active")}</option>
              <option value="inactive">{tl("inactive")}</option>
            </select>
          </div>

          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
            <Button type="submit">
              <Search className="size-4" />
              {tl("search")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchText("");
                setFilters({});
              }}
            >
              {tl("clearFilters")}
            </Button>
          </div>
        </form>
      </section>

      {loading && (
        <div className="rounded-lg border bg-card px-4 py-16 text-center">
          <div className="mx-auto mb-3 size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {tl("loadingExams")}
          </p>
        </div>
      )}

      {!loading && failed && (
        <ErrorState
          title={tl("couldnTLoadTheExams")}
          description={tl("couldnTReachTheServer")}
          onRetry={reload}
        />
      )}

      {!loading && !failed && (exams?.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-right text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{tl("examTitle")}</th>
                  <th className="px-4 py-3 font-medium">{tl("session")}</th>
                  <th className="px-4 py-3 font-medium">{tl("examType")}</th>
                  <th className="px-4 py-3 font-medium">{tl("deliveryMode")}</th>
                  <th className="px-4 py-3 font-medium">{tl("registrationStart")}</th>
                  <th className="px-4 py-3 font-medium">{tl("registrationEnd")}</th>
                  <th className="px-4 py-3 font-medium">{tl("status")}</th>
                  <th className="px-4 py-3 text-center font-medium">{tl("actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {exams!.map((exam) => (
                  <tr key={exam.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{exam.title}</td>
                    <td className="px-4 py-3">{exam.examSessionTitle || "—"}</td>
                    <td className="px-4 py-3">{exam.examTypeTitle || "—"}</td>
                    <td className="px-4 py-3">{exam.examModeTitle || "—"}</td>
                    <td className="px-4 py-3">
                      {date(new Date(exam.registrationStartDate))}
                    </td>
                    <td className="px-4 py-3">
                      {date(new Date(exam.registrationEndDate))}
                    </td>
                    <td className="px-4 py-3">
                      {exam.isActive ? (
                        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">
                          {tl("active")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {tl("inactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <Can controller="Exams" action="Update">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title={tl("edit")}
                            onClick={() => openEdit(exam)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </Can>
                        <Can controller="Exams" action="Delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            title={tl("delete")}
                            onClick={() => setDeleteTarget(exam)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !failed && exams?.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="size-5" />}
          title={tl("noExamsYet")}
          description={tl("defineANewExamTo")}
          action={
            <Can controller="Exams" action="Create">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                {tl("defineNewExam")}
              </Button>
            </Can>
          }
        />
      )}

      <ExamFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        exam={editingExam}
        sessions={sessions ?? []}
        examTypes={options?.examTypes ?? []}
        examModes={options?.examModes ?? []}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={tl("deleteExam")}
        description={
          deleteTarget
            ? tl("areYouSureYouWant", { p0: deleteTarget.title })
            : ""
        }
        confirmLabel={tl("deleteExam")}
        onConfirm={handleDelete}
      />
    </div>
  );
}