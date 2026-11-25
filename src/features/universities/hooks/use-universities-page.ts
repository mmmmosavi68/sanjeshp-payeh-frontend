"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { useRemoteData } from "@/hooks/use-remote-data";

import { deleteUniversity, listUniversities } from "../api";
import type { UniversityDto, UniversityFilters } from "../types";

/** State + data loading for the universities screen. */
export function useUniversitiesPage() {
  const tl = useTranslations("screens.universities.page");

  const [filters, setFilters] = useState<UniversityFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UniversityDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UniversityDto | null>(null);

  const list = useRemoteData(`universities-${JSON.stringify(filters)}`, () => listUniversities(filters));
  const parents = useRemoteData("university-parent-options", () => listUniversities({ isActive: true }));

  const patchFilters = useCallback((patch: Partial<UniversityFilters>) => setFilters((c) => ({ ...c, ...patch })), []);
  const setSearch = useCallback((value: string) => patchFilters({ search: value.trim() || undefined }), [patchFilters]);
  const clearFilters = useCallback(() => setFilters({}), []);
  const hasFilters = useMemo(() => Object.values(filters).some((v) => v !== undefined), [filters]);

  const reloadAll = useCallback(() => {
    list.reload();
    parents.reload();
  }, [list, parents]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    // Errors propagate to ConfirmDialog, which shows the translated server error.
    await deleteUniversity(deleteTarget.id);
    toast.success(tl("universityDeletedSuccessfully"));
    setDeleteTarget(null);
    reloadAll();
  }

  return {
    filters,
    patchFilters,
    setSearch,
    clearFilters,
    hasFilters,
    list,
    parentOptions: parents.data ?? [],
    formOpen,
    setFormOpen,
    editing,
    deleteTarget,
    setDeleteTarget,
    openCreate: () => {
      setEditing(null);
      setFormOpen(true);
    },
    openEdit: (university: UniversityDto) => {
      setEditing(university);
      setFormOpen(true);
    },
    reloadAll,
    confirmDelete,
  };
}
