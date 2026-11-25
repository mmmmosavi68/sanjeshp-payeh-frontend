"use client";

import { useTranslations } from "next-intl";

import { SearchableSelect } from "@/components/shared/searchable-select";
import { Button } from "@/components/ui/button";
import { CODE_GROUPS } from "@/constants/codes";
import { useCodeOptions } from "@/features/codes/hooks/use-code-options";
import { useFormatters } from "@/lib/format";

import type { UniversityDto, UniversityFilters } from "../types";

type Props = {
  filters: UniversityFilters;
  parentOptions: UniversityDto[];
  hasFilters: boolean;
  onChange: (patch: Partial<UniversityFilters>) => void;
  onClear: () => void;
};

type StatusValue = "active" | "inactive";

const REGIONS = Array.from({ length: 11 }, (_, i) => i + 1);

export function UniversitiesFilters({ filters, parentOptions, hasFilters, onChange, onClear }: Props) {
  const tl = useTranslations("screens.universities.page");
  const { num } = useFormatters();
  const types = useCodeOptions(CODE_GROUPS.universityType);
  const status = filters.isActive === undefined ? null : filters.isActive ? "active" : "inactive";

  return (
    <>
      <SearchableSelect
        className="w-full sm:w-44"
        aria-label={tl("universityType")}
        placeholder={tl("allTypes")}
        options={types.options}
        loading={types.loading}
        value={filters.universityTypeKey ?? null}
        onChange={(value) => onChange({ universityTypeKey: value })}
        onClear={() => onChange({ universityTypeKey: undefined })}
      />
      <SearchableSelect<number>
        className="w-full sm:w-36"
        aria-label={tl("region")}
        placeholder={tl("allRegions")}
        options={REGIONS.map((r) => ({ value: r, label: `${tl("region")} ${num(r)}`, keywords: [r] }))}
        value={filters.region ?? null}
        onChange={(value) => onChange({ region: value })}
        onClear={() => onChange({ region: undefined })}
      />
      <SearchableSelect<number>
        className="w-full sm:w-52"
        aria-label={tl("parentUniversity")}
        placeholder={tl("allUniversities")}
        options={parentOptions.map((u) => ({ value: u.id, label: u.title }))}
        value={filters.parentUniversityId ?? null}
        onChange={(value) => onChange({ parentUniversityId: value })}
        onClear={() => onChange({ parentUniversityId: undefined })}
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
