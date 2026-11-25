"use client";

import { useApiError } from "@/hooks/use-api-error";
import { useState } from "react";
import { CalendarClock, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { FormField } from "@/components/shared/form-field";
import { useRemoteData } from "@/hooks/use-remote-data";
import { Can } from "@/features/permissions/use-permission";

import {
  deleteExamSession,
  listExamSessions,
} from "@/features/exam-sessions/api";

import type {
  ExamSessionDto,
  ExamSessionFilters,
} from "@/features/exam-sessions/types";

import { ExamSessionsTable } from "@/features/exam-sessions/components/exam-sessions-table";
import { ExamSessionFormSheet } from "@/features/exam-sessions/components/exam-session-form-sheet";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";

export default function ExamSessionsPage() {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.examSessions.page");
  const { errorText } = useApiError();
  const [filters, setFilters] = useState<ExamSessionFilters>({});
  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingExamSession, setEditingExamSession] =
    useState<ExamSessionDto | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ExamSessionDto | null>(null);

  const filterKey = JSON.stringify(filters);

  const {
    data,
    loading,
    failed,
    reload,
  } = useRemoteData(
    `exam-sessions-${filterKey}`,
    () => listExamSessions(filters),
  );

  const examSessions = data ?? [];

  function openCreate() {
    setEditingExamSession(null);
    setFormOpen(true);
  }

  function openEdit(item: ExamSessionDto) {
    setEditingExamSession(item);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteExamSession(deleteTarget.id);

      toast.success(tl("examSessionDeletedSuccessfully"));

      setDeleteTarget(null);
      reload();
    } catch (error) {
      toast.error(
        errorText(error, tl("couldnTDeleteTheExam")),
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

  function handleStatusChange(value: string) {
    setFilters((current) => ({
      ...current,
      isActive:
        value === ""
          ? undefined
          : value === "active",
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {tl("examSessionManagement")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {tl("defineAndManageExamDates")}
          </p>
        </div>

        <Can controller="ExamSessions" action="Create">
          <Button
            onClick={openCreate}
            className="w-full rounded-full sm:w-auto"
          >
            <Plus className="size-4" />
            {tl("addExamSession")}
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
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <FormField
            id="exam-session-search"
            label={tl("sessionTitle")}
            placeholder={tl("searchBySessionTitle")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="exam-session-status"
              className="text-sm font-medium"
            >
              {tl("status")}
            </label>

            <select
              id="exam-session-status"
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive
                    ? "active"
                    : "inactive"
              }
              onChange={(event) => handleStatusChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{tl("allStatuses")}</option>
              <option value="active">{tl("active")}</option>
              <option value="inactive">{tl("inactive")}</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
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
            {tl("loadingExamSessions")}
          </p>
        </div>
      )}

      {!loading && failed && (
        <ErrorState
          title={tl("couldnTLoadTheExam")}
          description={tl("couldnTReachTheServer")}
          onRetry={reload}
        />
      )}

      {!loading && !failed && examSessions.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tl("results")}{" "}
              <span className="font-semibold text-foreground">
                {num(examSessions.length)}
              </span>
            </p>
          </div>

          <ExamSessionsTable
            examSessions={examSessions}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </>
      )}

      {!loading && !failed && examSessions.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="size-5" />}
          title={tl("noSessionsFound")}
          description={tl("noExamSessionsHaveBeen")}
          action={
            <Can controller="ExamSessions" action="Create">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                {tl("createNewSession")}
              </Button>
            </Can>
          }
        />
      )}

      <ExamSessionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        examSession={editingExamSession}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={tl("deleteExamSession")}
        description={
          deleteTarget
            ? tl("areYouSureYouWant", { p0: deleteTarget.title })
            : ""
        }
        confirmLabel={tl("deleteSession")}
        onConfirm={handleDelete}
      />
    </div>
  );
}