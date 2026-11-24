"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { useRemoteData } from "@/hooks/use-remote-data";

import { deleteCode, listCodes } from "@/features/codes/api";

import type { CodeDto } from "@/features/codes/types";

import { CodeFormSheet } from "@/features/codes/components/code-form-sheet";

export default function CodesPage() {
  const tl = useTranslations("screens.codes.page");

  const { data, loading, failed, reload } = useRemoteData("codes", listCodes);

  const codes = data ?? [];

  const root = useMemo(
    () =>
      codes.find(
        (code) =>
          code.parentId == null &&
          code.primaryCode === 0 &&
          code.subCode === 0,
      ),
    [codes],
  );

  const groups = useMemo(
    () =>
      root
        ? codes
            .filter(
              (code) => code.parentId === root.id && code.subCode === 0,
            )
            .sort((a, b) => (a.primaryCode ?? 0) - (b.primaryCode ?? 0))
        : [],
    [codes, root],
  );

  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: g.id,
        label: `${g.primaryCode} - ${g.title}`,
      })),
    [groups],
  );

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CodeDto | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CodeDto | null>(null);

  // انتخاب اولین گروه پس از دریافت اطلاعات
  useEffect(() => {
    if (groups.length === 0) {
      setSelectedGroupId(null);
      return;
    }

    const selectedExists = groups.some((group) => group.id === selectedGroupId);

    if (!selectedExists) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null;

  const items = useMemo(() => {
    if (!selectedGroup) return [];

    return codes
      .filter(
        (code) => code.parentId === selectedGroup.id && code.subCode !== 0,
      )
      .sort((a, b) => (a.subCode ?? 0) - (b.subCode ?? 0));
  }, [codes, selectedGroup]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa");

    if (!query) return items;

    return items.filter((item) => {
      const title = item.title.toLocaleLowerCase("fa");
      const standardCode = item.standardCode?.toString() ?? "";
      const subCode = item.subCode?.toString() ?? "";

      return (
        title.includes(query) ||
        standardCode.includes(query) ||
        subCode.includes(query)
      );
    });
  }, [items, search]);

  function handleCreateGroup() {
    if (!root) return;

    setEditingCode(null);
    setDefaultParentId(root.id);
    setFormOpen(true);
  }

  function handleCreateItem() {
    if (!selectedGroup) return;

    setEditingCode(null);
    setDefaultParentId(selectedGroup.id);
    setFormOpen(true);
  }

  function handleEdit(code: CodeDto) {
    setEditingCode(code);
    setDefaultParentId(null);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteCode(deleteTarget.id);

      toast.success(
        deleteTarget.subCode === 0
          ? tl("groupDeletedSuccessfully")
          : tl("itemDeletedSuccessfully"),
      );

      setDeleteTarget(null);
      reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف اطلاعات انجام نشد.",
      );
    }
  }

  return (
    <div className="space-y-3">
      {/* عنوان صفحه */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {tl("baseCodeManagement")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {tl("manageTheSystemSBase")}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleCreateGroup}
          disabled={!root}
        >
          <Plus className="size-3.5" />
          افزودن گروه
        </Button>
      </div>

      {loading && (
        <div className="rounded-lg border bg-card px-4 py-10 text-center">
          <div className="mx-auto mb-2 size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">{tl("loadingCodes")}</p>
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

      {!loading && !failed && root && (
        <>
          {groups.length === 0 ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                icon={<Database className="size-5" />}
                title={tl("noGroupsYet")}
                description={tl("createTheFirstBaseInformation")}
                action={
                  <Button size="sm" onClick={handleCreateGroup}>
                    <Plus className="size-3.5" />
                    {tl("createTheFirstGroup")}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              {/* نوار ابزار: گروه + جست‌وجو + افزودن در یک ردیف */}
              <div className="flex flex-wrap items-center gap-2 border-b p-2">
                <SearchableSelect
                  className="w-full sm:w-64"
                  options={groupOptions}
                  value={selectedGroupId}
                  onChange={(id) => {
                    setSelectedGroupId(id);
                    setSearch("");
                  }}
                  placeholder="انتخاب گروه..."
                  searchPlaceholder="جست‌وجوی گروه..."
                />

                {selectedGroup && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="ویرایش گروه"
                      onClick={() => handleEdit(selectedGroup)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="حذف گروه"
                      onClick={() => setDeleteTarget(selectedGroup)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                )}

                <div className="relative ms-auto w-full sm:w-56">
                  <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جست‌وجو در عنوان یا کد..."
                    className="h-8 ps-8 text-sm"
                    maxLength={100}
                    disabled={!selectedGroup}
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateItem}
                  disabled={!selectedGroup}
                >
                  <Plus className="size-3.5" />
                  افزودن عضو
                </Button>
              </div>

              {/* جدول */}
              {selectedGroup &&
                (filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Database className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? "موردی با این جست‌وجو پیدا نشد."
                        : "برای این گروه هنوز عضوی ثبت نشده است."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                          <th className="w-16 px-3 py-2 text-center font-medium">
                            کد فرعی
                          </th>
                          <th className="min-w-48 px-3 py-2 text-start font-medium">
                            عنوان
                          </th>
                          <th className="min-w-28 px-3 py-2 text-start font-medium">
                            کد استاندارد
                          </th>
                          <th className="min-w-40 px-3 py-2 text-start font-medium">
                            توضیحات
                          </th>
                          <th className="w-20 px-3 py-2 text-center font-medium">
                            وضعیت
                          </th>
                          <th className="w-20 px-3 py-2 text-center font-medium">
                            عملیات
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className={
                              !item.isActive
                                ? "opacity-60"
                                : "hover:bg-muted/30"
                            }
                          >
                            <td className="px-3 py-1.5 text-center tabular-nums">
                              {item.subCode ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 font-medium">
                              {item.title}
                            </td>
                            <td className="px-3 py-1.5 tabular-nums">
                              {item.standardCode ?? "—"}
                            </td>
                            <td className="max-w-xs px-3 py-1.5 text-muted-foreground">
                              <span className="block truncate">
                                {item.additionalInformation || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              <span
                                className={
                                  item.isActive
                                    ? "rounded-full bg-success/10 px-2 py-0.5 text-xs text-success"
                                    : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                }
                              >
                                {item.isActive ? "فعال" : "غیرفعال"}
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  title="ویرایش"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  title="حذف"
                                  onClick={() => setDeleteTarget(item)}
                                >
                                  <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

              {/* پانویس */}
              {selectedGroup && items.length > 0 && (
                <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                  نمایش {filteredItems.length.toLocaleString("fa")} از{" "}
                  {items.length.toLocaleString("fa")} عضو
                </div>
              )}
            </div>
          )}
        </>
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
          deleteTarget?.subCode === 0 ? tl("deleteGroup") : tl("deleteItem")
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