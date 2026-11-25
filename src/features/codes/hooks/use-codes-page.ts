"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CODE_GROUP_SUB_CODE, CODE_ROOT } from "@/constants/codes";
import { useApiError } from "@/hooks/use-api-error";
import { useRemoteData } from "@/hooks/use-remote-data";

import { deleteCode } from "../api";
import { loadCodes } from "../code-store";
import type { CodeDto } from "../types";

/** State, derived data and actions for the codes management screen. */
export function useCodesPage() {
  const tl = useTranslations("screens.codes.page");
  const { notifyError } = useApiError();

  const { data, loading, failed, reload } = useRemoteData("codes", () => loadCodes({ force: true }));

  const codes = useMemo(() => data ?? [], [data]);
  const root = useMemo(
    () => codes.find((c) => c.parentId == null && c.primaryCode === CODE_ROOT.primaryCode && c.subCode === CODE_ROOT.subCode),
    [codes],
  );
  const groups = useMemo(
    () =>
      root
        ? codes.filter((c) => c.parentId === root.id && c.subCode === CODE_GROUP_SUB_CODE).sort((a, b) => (a.primaryCode ?? 0) - (b.primaryCode ?? 0))
        : [],
    [codes, root],
  );

  const [pickedGroupId, setPickedGroupId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeDto | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CodeDto | null>(null);

  // Derived selection: falls back to the first group when the picked one no longer exists.
  const selectedGroup = groups.find((g) => g.id === pickedGroupId) ?? groups[0] ?? null;

  useEffect(() => {
    if (selectedGroup && selectedGroup.id !== pickedGroupId) setPickedGroupId(selectedGroup.id);
  }, [selectedGroup, pickedGroupId]);

  const items = useMemo(
    () =>
      selectedGroup
        ? codes.filter((c) => c.parentId === selectedGroup.id && c.subCode !== CODE_GROUP_SUB_CODE).sort((a, b) => (a.subCode ?? 0) - (b.subCode ?? 0))
        : [],
    [codes, selectedGroup],
  );

  function openForm(code: CodeDto | null, parentId: number | null) {
    setEditingCode(code);
    setDefaultParentId(parentId);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCode(deleteTarget.id);
      toast.success(deleteTarget.subCode === CODE_GROUP_SUB_CODE ? tl("groupDeletedSuccessfully") : tl("itemDeletedSuccessfully"));
      setDeleteTarget(null);
      reload();
    } catch (error) {
      notifyError(error);
    }
  }

  return {
    loading,
    failed,
    reload,
    root,
    groups,
    items,
    selectedGroup,
    selectGroup: setPickedGroupId,
    formOpen,
    setFormOpen,
    editingCode,
    defaultParentId,
    deleteTarget,
    setDeleteTarget,
    createGroup: () => root && openForm(null, root.id),
    createItem: () => selectedGroup && openForm(null, selectedGroup.id),
    edit: (code: CodeDto) => openForm(code, null),
    confirmDelete,
  };
}
