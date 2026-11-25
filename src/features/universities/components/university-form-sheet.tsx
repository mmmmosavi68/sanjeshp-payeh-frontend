"use client";

import { useApiError } from "@/hooks/use-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/shared/select-field";
import { FormAlert } from "@/components/shared/form-alert";
import { CODE_GROUPS } from "@/constants/codes";
import { useCodeOptions } from "@/features/codes/hooks/use-code-options";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { createUniversity, updateUniversity } from "../api";
import {
  createUniversitySchema,
  type UniversityFormInput,
  type UniversityFormValues,
} from "../schemas/university-schema";
import type { UniversityDto } from "../types";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";

type UniversityFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university: UniversityDto | null;
  universities: UniversityDto[];
  onSaved: () => void;
};

const emptyValues: UniversityFormInput = {
  title: "",
  universityTypeKey: "",
  region: 1,
  capacityApproved: 0,
  parentUniversityId: null,
  isActive: true,
};

export function UniversityFormSheet({
  open,
  onOpenChange,
  university,
  universities,
  onSaved,
}: UniversityFormSheetProps) {
  const tl = useTranslations("screens.universities.universityFormSheet");
  const { errorText } = useApiError();
  const { num } = useFormatters();
  const tv = useTranslations("validation.universities");
  const schema = useMemo(() => createUniversitySchema(tv), [tv]);
  const universityTypes = useCodeOptions(CODE_GROUPS.universityType);
  const isEdit = university !== null;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormInput, unknown, UniversityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;

    setFormError(null);

    if (university) {
      reset({
        title: university.title,
        universityTypeKey: university.universityTypeKey ?? "",
        region: university.region,
        capacityApproved: university.capacityApproved,
        parentUniversityId: university.parentUniversityId,
        isActive: university.isActive,
      });
    } else {
      reset(emptyValues);
    }
  }, [open, university, reset]);

  async function onSubmit(values: UniversityFormValues) {
    setFormError(null);

    const payload = {
      title: values.title.trim(),
      universityTypeKey: values.universityTypeKey,
      region: values.region,
      capacityApproved: values.capacityApproved,
      parentUniversityId: values.parentUniversityId,
    };

    try {
      if (university) {
        await updateUniversity(university.id, {
          ...payload,
          isActive: values.isActive,
        });

        toast.success(tl("universityDetailsUpdatedSuccessfully"));
      } else {
        await createUniversity(payload);

        toast.success(tl("universityCreatedSuccessfully"));
      }

      onOpenChange(false);
      onSaved();
    } catch (error) {
      setFormError(
        errorText(error, tl("couldnTSaveTheUniversity")),
      );
    }
  }

  const parentOptions = universities.filter(
    (item) => item.isActive && item.id !== university?.id,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-4 py-3 pe-14">
          <SheetTitle>
            {isEdit ? tl("editUniversity") : tl("addNewUniversity")}
          </SheetTitle>

          <SheetDescription>
            {tl("specifyTheUniversityDetailsAnd")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
            <FormAlert message={formError} />

            {!universityTypes.loading && universityTypes.options.length === 0 && (
              <div
                role="alert"
                className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm"
              >
                {tl("theUniversityTypeGroupOr")}
              </div>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold">{tl("mainInformation")}</h3>

              <FormField
                id="university-title"
                label={tl("universityName")}
                placeholder={tl("enterTheUniversityName")}
                maxLength={200}
                error={errors.title?.message}
                {...register("title")}
              />

              <Controller
                control={control}
                name="universityTypeKey"
                render={({ field }) => (
                  <SelectField
                    label={tl("universityType")}
                    placeholder={tl("selectUniversityType")}
                    options={universityTypes.options}
                    loading={universityTypes.loading}
                    value={field.value || null}
                    onChange={field.onChange}
                    error={errors.universityTypeKey?.message}
                  />
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="region"
                  render={({ field }) => (
                    <SelectField<number>
                      label={tl("region")}
                      options={Array.from({ length: 11 }, (_, i) => i + 1).map((r) => ({ value: r, label: `${tl("region")} ${num(r)}` }))}
                      value={Number(field.value) || null}
                      onChange={field.onChange}
                      error={errors.region?.message}
                    />
                  )}
                />

                <FormField
                  id="university-capacity"
                  label={tl("approvedCapacity")}
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  error={errors.capacityApproved?.message}
                  {...register("capacityApproved", {
                    setValueAs: (value) => (value === "" ? 0 : Number(value)),
                  })}
                />
              </div>

              <Controller
                control={control}
                name="parentUniversityId"
                render={({ field }) => (
                  <SelectField<number>
                    label={tl("parentUniversity")}
                    placeholder={tl("noParentUniversity")}
                    options={parentOptions.map((item) => ({ value: item.id, label: item.title }))}
                    value={typeof field.value === "number" ? field.value : null}
                    onChange={field.onChange}
                    onClear={() => field.onChange(null)}
                    error={errors.parentUniversityId?.message}
                  />
                )}
              />

              {isEdit && (
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="university-active"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />

                      <Label
                        htmlFor="university-active"
                        className="font-normal"
                      >
                        {tl("thisUniversityIsActive")}
                      </Label>
                    </div>
                  )}
                />
              )}
            </section>
          </div>

          <SheetFooter className="border-t px-4 py-4">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                {tl("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || (!universityTypes.loading && universityTypes.options.length === 0)}
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}

                {isEdit ? tl("saveChanges") : tl("createUniversity")}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
