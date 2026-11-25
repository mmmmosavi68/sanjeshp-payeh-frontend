"use client";

import { Database, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { IconButton } from "@/components/shared/icon-button";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { Button } from "@/components/ui/button";
import { CodeFormSheet } from "@/features/codes/components/code-form-sheet";
import { CodesItemsTable } from "@/features/codes/components/codes-items-table";
import { useCodesPage } from "@/features/codes/hooks/use-codes-page";
import { useFormatters } from "@/lib/format";

export default function CodesPage() {
  const tl = useTranslations("screens.codes.page");
  const { num } = useFormatters();
  const page = useCodesPage();
  const { root, groups, selectedGroup } = page;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={tl("baseCodeManagement")}
          description={tl("manageTheSystemSBase")}
        />
        <Button
          type="button"
          size="sm"
          onClick={page.createGroup}
          disabled={!root}
        >
          <Plus className="size-3.5" aria-hidden />
          {tl("addGroup")}
        </Button>
      </div>

      {page.loading ? (
        <LoadingState
          label={tl("loadingCodes")}
          className="rounded-lg border bg-card"
        />
      ) : null}

      {!page.loading && page.failed ? (
        <ErrorState
          title={tl("couldnTLoadTheCodes")}
          description={tl("couldnTReachTheServer")}
          onRetry={page.reload}
        />
      ) : null}

      {!page.loading && !page.failed && !root ? (
        <ErrorState
          title={tl("rootCodeStructureNotFound")}
          description={tl("theRootRecordOfThe")}
          onRetry={page.reload}
        />
      ) : null}

      {!page.loading && !page.failed && root ? (
        groups.length === 0 || !selectedGroup ? (
          <div className="rounded-lg border bg-card">
            <EmptyState
              icon={<Database className="size-5" aria-hidden />}
              title={tl("noGroupsYet")}
              description={tl("createTheFirstBaseInformation")}
              action={
                <Button size="sm" onClick={page.createGroup}>
                  <Plus className="size-3.5" aria-hidden />
                  {tl("createTheFirstGroup")}
                </Button>
              }
            />
          </div>
        ) : (
          <CodesItemsTable
            // Reset search/sort/page state when switching groups.
            key={selectedGroup.id}
            items={page.items}
            groupTitle={selectedGroup.title}
            onCreate={page.createItem}
            onEdit={page.edit}
            onDelete={page.setDeleteTarget}
            toolbar={
              <>
                <SearchableSelect<number>
                  className="w-full sm:w-64"
                  aria-label={tl("groupSelectLabel")}
                  placeholder={tl("selectGroupPlaceholder")}
                  searchPlaceholder={tl("searchGroups")}
                  options={groups.map((g) => ({
                    value: g.id,
                    label: `${num(g.primaryCode ?? 0)} - ${g.title}`,
                    keywords: [g.primaryCode],
                  }))}
                  value={selectedGroup.id}
                  onChange={page.selectGroup}
                />
                <IconButton
                  label={tl("editGroupTooltip")}
                  icon={<Pencil className="size-3.5" aria-hidden />}
                  onClick={() => page.edit(selectedGroup)}
                />
                <IconButton
                  label={tl("deleteGroupTooltip")}
                  icon={
                    <Trash2 className="size-3.5 text-destructive" aria-hidden />
                  }
                  onClick={() => page.setDeleteTarget(selectedGroup)}
                />
                <Button type="button" size="sm" onClick={page.createItem}>
                  <Plus className="size-3.5" aria-hidden />
                  {tl("addItem")}
                </Button>
              </>
            }
          />
        )
      ) : null}

      {root ? (
        <CodeFormSheet
          open={page.formOpen}
          onOpenChange={page.setFormOpen}
          code={page.editingCode}
          rootId={root.id}
          groups={groups}
          defaultParentId={page.defaultParentId}
          onSaved={page.reload}
        />
      ) : null}

      <ConfirmDialog
        open={page.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) page.setDeleteTarget(null);
        }}
        title={
          page.deleteTarget?.subCode === 0
            ? tl("deleteGroup")
            : tl("deleteItem")
        }
        description={
          page.deleteTarget
            ? tl("areYouSureYouWant", { p0: page.deleteTarget.title })
            : ""
        }
        confirmLabel={tl("delete")}
        onConfirm={page.confirmDelete}
      />
    </div>
  );
}
