
"use client";

import {
  ChevronDown,
  ChevronLeft,
  Code2,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { CodeDto } from "../types";
import { useTranslations } from "next-intl";

type CodesTreeProps = {
  root: CodeDto;
  groups: CodeDto[];
  codes: CodeDto[];
  onCreateGroup: () => void;
  onCreateItem: (group: CodeDto) => void;
  onEdit: (code: CodeDto) => void;
  onDelete: (code: CodeDto) => void;
};

type CodeGroupNode = CodeDto & {
  children: CodeDto[];
};

export function CodesTree({
  root,
  groups,
  codes,
  onCreateGroup,
  onCreateItem,
  onEdit,
  onDelete,
}: CodesTreeProps) {
  const tl = useTranslations("screens.codes.codesTree");
  const [search, setSearch] = useState("");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(groups.map((group) => group.id)),
  );

  const tree = useMemo<CodeGroupNode[]>(() => {
    return groups
      .map((group) => ({
        ...group,
        children: codes
          .filter((code) => code.parentId === group.id)
          .sort((a, b) => {
            const aCode = a.subCode ?? Number.MAX_SAFE_INTEGER;
            const bCode = b.subCode ?? Number.MAX_SAFE_INTEGER;

            return aCode - bCode || a.title.localeCompare(b.title, "fa");
          }),
      }))
      .sort((a, b) => {
        const aCode = a.primaryCode ?? Number.MAX_SAFE_INTEGER;
        const bCode = b.primaryCode ?? Number.MAX_SAFE_INTEGER;

        return aCode - bCode || a.title.localeCompare(b.title, "fa");
      });
  }, [groups, codes]);

  const filteredTree = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa");

    if (!query) return tree;

    return tree
      .map((group) => {
        const matchingItems = group.children.filter((item) =>
          item.title.toLocaleLowerCase("fa").includes(query),
        );

        const groupMatches = group.title
          .toLocaleLowerCase("fa")
          .includes(query);

        if (!groupMatches && matchingItems.length === 0) {
          return null;
        }

        return {
          ...group,
          children: groupMatches ? group.children : matchingItems,
        };
      })
      .filter((group): group is CodeGroupNode => group !== null);
  }, [tree, search]);

  const searching = search.trim().length > 0;

  function toggleGroup(id: number) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function expandAll() {
    setExpandedIds(new Set(groups.map((group) => group.id)));
  }

  function collapseAll() {
    setExpandedIds(new Set());
  }

  function renderItem(item: CodeDto) {
    return (
      <div
        key={item.id}
        className={cn(
          "group flex min-h-(--density-control) items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70",
          !item.isActive && "opacity-60",
        )}
        style={{ paddingInlineStart: "56px" }}
      >
        <span className="grid size-7 shrink-0 place-items-center">
          <span className="size-1.5 rounded-full bg-border" />
        </span>

        <Code2
          className="size-4 shrink-0 text-info"
          aria-hidden
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">
              {item.title}
            </span>

            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
              {`SubCode: ${item.subCode ?? "—"}`}
            </span>

            {item.standardCode !== null && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {`Standard: ${item.standardCode}`}
              </span>
            )}

            {!item.isActive && (
              <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                {tl("inactive")}
              </span>
            )}
          </div>

          {item.additionalInformation && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.additionalInformation}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              title={tl("addItem")}
              aria-label={tl("addItemTo", { p0: item.title })}
              onClick={() => onCreateItem(item)}
            >
              <Plus className="size-4" />
            </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8"
            title={tl("editItem")}
            aria-label={tl("edit", { p0: item.title })}
            onClick={() => onEdit(item)}
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-destructive hover:text-destructive"
            title={tl("deleteItem")}
            aria-label={tl("delete", { p0: item.title })}
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  function renderGroup(group: CodeGroupNode) {
    const hasChildren = group.children.length > 0;
    const isExpanded = searching || expandedIds.has(group.id);

    const Icon = isExpanded ? FolderOpen : Folder;

    return (
      <div key={group.id}>
        <div
          className={cn(
            "group flex min-h-12 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70",
            !group.isActive && "opacity-60",
          )}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleGroup(group.id)}
            disabled={!hasChildren}
            aria-label={
              isExpanded ? tl("collapseGroupItems") : tl("expandGroupItems")
            }
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors",
              hasChildren
                ? "hover:bg-muted-foreground/10"
                : "cursor-default opacity-30",
            )}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )
            ) : (
              <span className="size-1.5 rounded-full bg-border" />
            )}
          </button>

          <Icon
            className="size-4 shrink-0 text-warning"
            aria-hidden
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold">
                {group.title}
              </span>

              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {`PrimaryCode: ${group.primaryCode ?? "—"}`}
              </span>

              {!group.isActive && (
                <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                  {tl("inactive")}
                </span>
              )}
            </div>

            {group.additionalInformation && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {group.additionalInformation}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              title={tl("addItem")}
              aria-label={tl("addItemTo", { p0: group.title })}
              onClick={() => onCreateItem(group)}
            >
              <Plus className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              title={tl("editGroup")}
              aria-label={tl("edit", { p0: group.title })}
              onClick={() => onEdit(group)}
            >
              <Pencil className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-destructive hover:text-destructive"
              title={tl("deleteGroup")}
              aria-label={tl("delete", { p0: group.title })}
              onClick={() => onDelete(group)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-s border-border/70 ms-[22px]">
            {group.children.map(renderItem)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />

          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tl("searchGroupsAndItems")}
            aria-label={tl("searchCodes")}
            maxLength={100}
            className="h-9 ps-9"
          />
        </div>

        <Button
          type="button"
          onClick={onCreateGroup}
        >
          <Plus className="size-4" aria-hidden />
          {tl("addGroup")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Folder className="size-4 text-muted-foreground" />

            <span className="text-sm font-medium">
              {tl("baseCodeStructure")}
            </span>

            <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {codes.length - 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={expandAll}
              disabled={groups.length === 0}
            >
              {tl("expandAll")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              disabled={groups.length === 0}
            >
              {tl("collapseAll")}
            </Button>
          </div>
        </div>

        {filteredTree.length > 0 ? (
          <div className="p-3">
            {filteredTree.map(renderGroup)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Folder className="size-9 text-muted-foreground/50" />

            <p className="text-sm font-medium">
              {search
                ? tl("noResultsMatchYourSearch")
                : tl("noGroupsYet")}
            </p>

            <p className="text-xs text-muted-foreground">
              {search
                ? tl("tryADifferentSearchTerm")
                : tl("toGetStartedCreateA", { p0: root.title })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
