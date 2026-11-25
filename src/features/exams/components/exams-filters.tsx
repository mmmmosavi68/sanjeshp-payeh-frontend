"use client";

import { useTranslations } from "next-intl";

import { SearchableSelect } from "@/components/shared/searchable-select";
import { Button } from "@/components/ui/button";
import { CODE_GROUPS } from "@/constants/codes";
import { useCodeOptions } from "@/features/codes/hooks/use-code-options";

import type { ExamFilters, ExamSessionOption } from "../types";

type ExamsFiltersProps = {
  filters: ExamFilters;
  sessions: ExamSessionOption[];
  hasFilters: boolean;
  onChange: (patch: Partial<ExamFilters>) => void;
  onClear: () => void;
};

type StatusValue = "active" | "inactive";

export function ExamsFilters({ filters, sessions, hasFilters, onChange, onClear }: ExamsFiltersProps) {
  const tl = useTranslations("screens.exams.page");
  const types = useCodeOptions(CODE_GROUPS.examType);
  const modes = useCodeOptions(CODE_GROUPS.examMode);
  const status = filters.isActive === undefined ? null : filters.isActive ? "active" : "inactive";

  return (
    <>
      <SearchableSelect
        className="w-full sm:w-48"
        aria-label={tl("examSession")}
        placeholder={tl("allSessions")}
        options={sessions.map((s) => ({ value: s.id, label: s.title }))}
        value={filters.examSessionId ?? null}
        onChange={(value) => onChange({ examSessionId: value })}
        onClear={() => onChange({ examSessionId: undefined })}
      />
      <SearchableSelect
        className="w-full sm:w-44"
        aria-label={tl("examType")}
        placeholder={tl("allTypes")}
        options={types.options}
        loading={types.loading}
        value={filters.examTypeKey ?? null}
        onChange={(value) => onChange({ examTypeKey: value })}
        onClear={() => onChange({ examTypeKey: undefined })}
      />
      <SearchableSelect
        className="w-full sm:w-44"
        aria-label={tl("deliveryMode")}
        placeholder={tl("allModes")}
        options={modes.options}
        loading={modes.loading}
        value={filters.examModeKey ?? null}
        onChange={(value) => onChange({ examModeKey: value })}
        onClear={() => onChange({ examModeKey: undefined })}
      />
      <SearchableSelect<StatusValue>
        className="w-full sm:w-36"
        aria-label={tl("status")}
        placeholder={tl("allStatuses")}
        options={[
          { value: "active", label: tl("active") },
          { value: "inactive", label: tl("inactive") },
        ]}
        value={status}
        onChange={(value) => onChange({ isActive: value === "active" })}
        onClear={() => onChange({ isActive: undefined })}
      />
      {hasFilters ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          {tl("clearFilters")}
        </Button>
      ) : null}
    </>
  );
}
