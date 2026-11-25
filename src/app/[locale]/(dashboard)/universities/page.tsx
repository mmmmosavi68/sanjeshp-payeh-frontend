"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/permissions/use-permission";
import { UniversitiesFilters } from "@/features/universities/components/universities-filters";
import { UniversitiesTable } from "@/features/universities/components/universities-table";
import { UniversityFormSheet } from "@/features/universities/components/university-form-sheet";
import { useUniversitiesPage } from "@/features/universities/hooks/use-universities-page";

export default function UniversitiesPage() {
  const tl = useTranslations("screens.universities.page");
  const page = useUniversitiesPage();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={tl("universityManagement")} description={tl("manageUniversitiesApprovedCapacityAnd")} />
        <Can controller="Universities" action="Create">
          <Button onClick={page.openCreate}>
            <Plus className="size-4" aria-hidden />
            {tl("addUniversity")}
          </Button>
        </Can>
      </div>

      <UniversitiesTable
        rows={page.list.data}
        loading={page.list.loading}
        failed={page.list.failed}
        onRetry={page.list.reload}
        search={{ value: page.filters.search ?? "", onChange: page.setSearch }}
        toolbar={
          <UniversitiesFilters
            filters={page.filters}
            parentOptions={page.parentOptions}
            hasFilters={page.hasFilters}
            onChange={page.patchFilters}
            onClear={page.clearFilters}
          />
        }
        onCreate={page.openCreate}
        onEdit={page.openEdit}
        onDelete={page.setDeleteTarget}
      />

      <UniversityFormSheet
        open={page.formOpen}
        onOpenChange={page.setFormOpen}
        university={page.editing}
        universities={page.parentOptions}
        onSaved={page.reloadAll}
      />

      <ConfirmDialog
        open={page.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) page.setDeleteTarget(null);
        }}
        title={tl("deleteUniversity")}
        description={page.deleteTarget ? tl("areYouSureYouWant", { p0: page.deleteTarget.title }) : ""}
        confirmLabel={tl("deleteUniversity")}
        onConfirm={page.confirmDelete}
      />
    </div>
  );
}
