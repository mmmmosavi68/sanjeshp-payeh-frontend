
"use client";

import { useState } from "react";
import { Database, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { useRemoteData } from "@/hooks/use-remote-data";

import { deleteCode, listCodes } from "@/features/codes/api";
import type { CodeDto } from "@/features/codes/types";

import { CodesTree } from "@/features/codes/components/codes-tree";
import { CodeFormSheet } from "@/features/codes/components/code-form-sheet";
import { useTranslations } from "next-intl";

export default function CodesPage() {
  const tl = useTranslations("screens.codes.page");
  const {
    data,
    loading,
    failed,
    reload,
  } = useRemoteData("codes", listCodes);

  const codes = data ?? [];

const root = codes.find(
  (code) =>
    code.parentId == null &&
    code.primaryCode === 0 &&
    code.subCode === 0,
);

  const groups = root
    ? codes.filter(
        (code) =>
          code.parentId === root.id &&
          code.subCode === 0,
      )
    : [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeDto | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CodeDto | null>(null);

  function handleCreateGroup() {
    if (!root) return;

    setEditingCode(null);
    setDefaultParentId(root.id);
    setFormOpen(true);
  }

  function handleCreateItem(group: CodeDto) {
    setEditingCode(null);
    setDefaultParentId(group.id);
    setFormOpen(true);
  }

  function handleEdit(code: CodeDto) {
    setEditingCode(code);
    setDefaultParentId(null);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    await deleteCode(deleteTarget.id);

    toast.success(
      deleteTarget.subCode === 0
        ? tl("groupDeletedSuccessfully")
        : tl("itemDeletedSuccessfully"),
    );

    setDeleteTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {tl("baseCodeManagement")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {tl("manageTheSystemSBase")}
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border bg-card px-4 py-16 text-center">
          <div className="mx-auto mb-3 size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />

          <p className="text-sm text-muted-foreground">
            {tl("loadingCodes")}
          </p>
        </div>
      )}

      {!loading && failed && (
        <ErrorState
          title={tl("couldnTLoadTheCodes")}
          description={tl("couldnTReachTheServer")}
          onRetry={reload}
        />
      )}

      {!loading && !failed && !root && (
        <ErrorState
          title={tl("rootCodeStructureNotFound")}
          description={tl("theRootRecordOfThe")}
          onRetry={reload}
        />
      )}

      {!loading && !failed && root && groups.length > 0 && (
        <CodesTree
          root={root}
          groups={groups}
          codes={codes}
          onCreateGroup={handleCreateGroup}
          onCreateItem={handleCreateItem}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {!loading && !failed && root && groups.length === 0 && (
        <EmptyState
          icon={<Database className="size-5" />}
          title={tl("noGroupsYet")}
          description={tl("createTheFirstBaseInformation")}
          action={
            <Button
              onClick={handleCreateGroup}
            >
              <Plus className="size-4" />
              {tl("createTheFirstGroup")}
            </Button>
          }
        />
      )}

      {root && (
        <CodeFormSheet
          open={formOpen}
          onOpenChange={setFormOpen}
          code={editingCode}
          rootId={root.id}
          groups={groups}
          defaultParentId={defaultParentId}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          deleteTarget?.subCode === 0
            ? tl("deleteGroup")
            : tl("deleteItem")
        }
        description={
          deleteTarget
            ? tl("areYouSureYouWant", { p0: deleteTarget.title })
            : ""
        }
        confirmLabel={tl("delete")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
