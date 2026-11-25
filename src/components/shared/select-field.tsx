"use client";

import { useId } from "react";

import { Label } from "@/components/ui/label";
import { SearchableSelect, type SearchableSelectProps } from "./searchable-select";

type SelectFieldProps<V extends string | number> = Omit<SearchableSelectProps<V>, "id" | "aria-labelledby"> & {
  label: string;
  hint?: string;
};

/** Label + SearchableSelect + error, same layout as FormField. */
export function SelectField<V extends string | number>({ label, hint, className, ...props }: SelectFieldProps<V>) {
  const id = useId();
  return (
    <div className={className ? `flex flex-col gap-2 ${className}` : "flex flex-col gap-2"}>
      <Label htmlFor={id}>{label}</Label>
      <SearchableSelect<V> id={id} {...props} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
