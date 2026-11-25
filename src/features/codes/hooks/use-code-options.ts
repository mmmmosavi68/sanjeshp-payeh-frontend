"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CODE_GROUP_SUB_CODE, CODE_ROOT } from "@/constants/codes";
import type { SearchableOption } from "@/components/shared/searchable-select";

import { codeRefOf, toCodeKey, type CodeKey } from "../adapter";
import { loadCodes } from "../code-store";
import type { CodeDto } from "../types";

/** Display title in the current language (falls back to the default title). */
export function localizedCodeTitle(code: Pick<CodeDto, "title" | "titleEn">, locale: string): string {
  return ((locale === "en" ? code.titleEn : null) ?? code.title).trim();
}

/** Active items of the group identified by `primaryCode` (pure — usable outside React). */
export function selectGroupItems(codes: readonly CodeDto[], primaryCode: number): CodeDto[] {
  const root = codes.find((c) => c.parentId === null && c.primaryCode === CODE_ROOT.primaryCode && c.subCode === CODE_ROOT.subCode && c.isActive);
  if (!root) return [];
  const group = codes.find((c) => c.parentId === root.id && c.primaryCode === primaryCode && c.subCode === CODE_GROUP_SUB_CODE && c.isActive);
  if (!group) return [];
  return codes.filter((c) => c.parentId === group.id && c.isActive && c.title.trim() !== "" && c.subCode !== CODE_GROUP_SUB_CODE);
}

type State = { codes: CodeDto[] | null; error: unknown; version: number };

/**
 * One hook for every code-based Select: `useCodeOptions(CODE_GROUPS.examType)`.
 * Option `value` is always the `primaryCode:subCode` key; titles are localized for display only.
 */
export function useCodeOptions(primaryCode: number) {
  const locale = useLocale();
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State>({ codes: null, error: null, version: -1 });

  useEffect(() => {
    let cancelled = false;
    loadCodes({ force: version > 0 })
      .then((codes) => !cancelled && setState({ codes, error: null, version }))
      .catch((error: unknown) => !cancelled && setState({ codes: null, error, version }));
    return () => {
      cancelled = true;
    };
  }, [version]);

  const options = useMemo<SearchableOption<CodeKey>[]>(() => {
    if (!state.codes) return [];
    const collator = new Intl.Collator(locale);
    return selectGroupItems(state.codes, primaryCode)
      .flatMap((code) => {
        const ref = codeRefOf(code);
        return ref ? [{ value: toCodeKey(ref), label: localizedCodeTitle(code, locale) }] : [];
      })
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [state.codes, primaryCode, locale]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    options,
    codes: state.codes,
    loading: state.version !== version,
    error: state.version === version ? state.error : null,
    reload,
  };
}
