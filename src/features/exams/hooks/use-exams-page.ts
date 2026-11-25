"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { useApiError } from "@/hooks/use-api-error";
import { useRemoteData } from "@/hooks/use-remote-data";

import { deleteExam, listExams, listExamSessions } from "../api";
import type { ExamDto, ExamFilters, ExamSessionOption } from "../types";

/** State + data loading for the exams screen (the page itself only composes components). */
export function useExamsPage() {
  const tl = useTranslations("screens.exams.page");
  const { notifyError } = useApiError();

  const [filters, setFilters] = useState<ExamFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamDto | null>(null);

  const exams = useRemoteData(`exams-${JSON.stringify(filters)}`, () => listExams(filters));
  const sessions = useRemoteData<ExamSessionOption[]>("exam-session-options", listExamSessions);

  const patchFilters = useCallback((patch: Partial<ExamFilters>) => setFilters((current) => ({ ...current, ...patch })), []);
  const setSearch = useCallback((value: string) => patchFilters({ search: value.trim() || undefined }), [patchFilters]);
  const clearFilters = useCallback(() => setFilters({}), []);

  const hasFilters = useMemo(() => Object.values(filters).some((v) => v !== undefined), [filters]);

  function openCreate() {
    setEditingExam(null);
    setFormOpen(true);
  }

  function openEdit(exam: ExamDto) {
    setEditingExam(exam);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExam(deleteTarget.id);
      toast.success(tl("examDeletedSuccessfully"));
      setDeleteTarget(null);
      exams.reload();
    } catch (error) {
      notifyError(error, tl("couldnTDeleteTheExam"));
    }
  }

  return {
    filters,
    patchFilters,
    setSearch,
    clearFilters,
    hasFilters,
    exams,
    sessions: sessions.data ?? [],
    formOpen,
    setFormOpen,
    editingExam,
    deleteTarget,
    setDeleteTarget,
    openCreate,
    openEdit,
    confirmDelete,
  };
}
