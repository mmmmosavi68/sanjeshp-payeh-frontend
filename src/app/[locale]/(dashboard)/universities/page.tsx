
"use client";

import { useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { FormField } from "@/components/shared/form-field";
import { useRemoteData } from "@/hooks/use-remote-data";

import { listCodes } from "@/features/codes/api";
import { Can } from "@/features/permissions/use-permission";

import {
  deleteUniversity,
  listUniversities,
} from "@/features/universities/api";

import {
  getUniversityTypeOptions,
} from "@/features/universities/options";

import type {
  UniversityDto,
  UniversityFilters,
} from "@/features/universities/types";

import { UniversitiesTable } from "@/features/universities/components/universities-table";
import { UniversityFormSheet } from "@/features/universities/components/university-form-sheet";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";

export default function UniversitiesPage() {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.universities.page");
  const [filters, setFilters] = useState<UniversityFilters>({});
  const [searchText, setSearchText] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] =
    useState<UniversityDto | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<UniversityDto | null>(null);

  const filterKey = JSON.stringify(filters);

  const {
    data,
    loading,
    failed,
    reload,
  } = useRemoteData(
    `universities-${filterKey}`,
    () => listUniversities(filters),
  );

  const {
    data: parentUniversities,
    reload: reloadParents,
  } = useRemoteData(
    "university-parent-options",
    () => listUniversities({ isActive: true }),
  );
  const {
    data: codes,
    loading: codesLoading,
  } = useRemoteData("university-type-codes", listCodes);

  const universities = data ?? [];
  const parentOptions = parentUniversities ?? [];
  const universityTypes = getUniversityTypeOptions(codes ?? []);

  function handleCreate() {
    setEditingUniversity(null);
    setFormOpen(true);
  }

  function handleEdit(university: UniversityDto) {
    setEditingUniversity(university);
    setFormOpen(true);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      search: searchText.trim() || undefined,
    }));
  }

  function handleRegionChange(value: string) {
    setFilters((current) => ({
      ...current,
      region: value ? Number(value) : undefined,
    }));
  }

  function handleTypeChange(value: string) {
    setFilters((current) => ({
      ...current,
      universityTypeId: value ? Number(value) : undefined,
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

  function handleParentChange(value: string) {
    setFilters((current) => ({
      ...current,
      parentUniversityId: value ? Number(value) : undefined,
    }));
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    await deleteUniversity(deleteTarget.id);

    toast.success(tl("universityDeletedSuccessfully"));

    setDeleteTarget(null);
    reload();
    reloadParents();
  }

  function handleSaved() {
    reload();
    reloadParents();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {tl("universityManagement")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {tl("manageUniversitiesApprovedCapacityAnd")}
          </p>
        </div>

        <Can controller="Universities" action="Create">
          <Button
            onClick={handleCreate}
            className="w-full rounded-full sm:w-auto"
          >
            <Plus className="size-4" />
            {tl("addUniversity")}
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
            id="university-search"
            label={tl("universityName")}
            placeholder={tl("searchByUniversityName")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="filter-university-type" className="text-sm font-medium">
              {tl("universityType")}
            </label>

            <select
              id="filter-university-type"
              value={filters.universityTypeId ?? ""}
              onChange={(event) => handleTypeChange(event.target.value)}
              disabled={codesLoading}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{tl("allTypes")}</option>

              {universityTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="filter-university-region" className="text-sm font-medium">
              {tl("region")}
            </label>

            <select
              id="filter-university-region"
              value={filters.region ?? ""}
              onChange={(event) => handleRegionChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{tl("allRegions")}</option>

              {Array.from({ length: 11 }, (_, index) => index + 1).map(
                (region) => (
                  <option key={region} value={region}>
                    {tl("region")} {region}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="filter-university-parent" className="text-sm font-medium">
              {tl("parentUniversity")}
            </label>

            <select
              id="filter-university-parent"
              value={filters.parentUniversityId ?? ""}
              onChange={(event) => handleParentChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{tl("allUniversities")}</option>

              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="filter-university-status" className="text-sm font-medium">
              {tl("status")}
            </label>

            <select
              id="filter-university-status"
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
            {tl("loadingUniversities")}
          </p>
        </div>
      )}

      {!loading && failed && (
        <ErrorState
          title={tl("couldnTLoadTheUniversities")}
          description={tl("couldnTReachTheServer")}
          onRetry={reload}
        />
      )}

      {!loading && !failed && universities.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tl("results")}{" "}
              <span className="font-semibold text-foreground">
                {num(universities.length)}
              </span>
            </p>
          </div>

          <UniversitiesTable
            universities={universities}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        </>
      )}

      {!loading && !failed && universities.length === 0 && (
        <EmptyState
          icon={<Building2 className="size-5" />}
          title={tl("noUniversitiesFound")}
          description={tl("noUniversitiesMatchTheCurrent")}
          action={
            <Can controller="Universities" action="Create">
              <Button
                onClick={handleCreate}
              >
                <Plus className="size-4" />
                {tl("addNewUniversity")}
              </Button>
            </Can>
          }
        />
      )}

      <UniversityFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        university={editingUniversity}
        universities={parentOptions}
        universityTypes={universityTypes}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={tl("deleteUniversity")}
        description={
          deleteTarget
            ? tl("areYouSureYouWant", { p0: deleteTarget.title })
            : ""
        }
        confirmLabel={tl("deleteUniversity")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
