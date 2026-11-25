
"use client";

import { useApiError } from "@/hooks/use-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createGroup, updateGroup } from "../api";
import { createGroupSchema, type GroupFormInput } from "../schemas/group-schema";
import type { GroupDto } from "../types";
import { useTranslations } from "next-intl";

type GroupFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupDto | null;
  onSaved: () => void;
};

export function GroupFormDialog({
  open,
  onOpenChange,
  group,
  onSaved,
}: GroupFormDialogProps) {
  const tl = useTranslations("screens.groups.groupFormDialog");
  const { errorText } = useApiError();
  const tv = useTranslations("validation.groups");
  const schema = useMemo(() => createGroupSchema(tv), [tv]);
  const editing = group !== null;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupName: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    reset({
      groupName: group?.groupName ?? "",
      isActive: group?.isActive ?? true,
    });
    setFormError(null);
  }, [group, open, reset]);

  async function onSubmit(values: GroupFormInput) {
    setFormError(null);

    try {
      const payload = {
        groupName: values.groupName.trim(),
        isActive: values.isActive,
      };

      if (group) {
        await updateGroup(group.id, payload);
        toast.success(tl("groupUpdatedSuccessfully"));
      } else {
        await createGroup(payload);
        toast.success(tl("groupCreatedSuccessfully"));
      }

      onOpenChange(false);
      onSaved();
    } catch (error) {
      setFormError(
        errorText(error, tl("couldnTSaveTheGroup")),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? tl("editUserGroup") : tl("createUserGroup")}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? tl("editTheUserGroupDetails")
              : tl("enterTheDetailsOfThe")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {formError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">{tl("groupTitle")}</Label>
            <Input
              id="group-name"
              placeholder={tl("eGSystemAdministrators")}
              maxLength={100}
              autoFocus
              {...register("groupName")}
              aria-invalid={Boolean(errors.groupName)}
            />
            {errors.groupName?.message ? (
              <p className="text-xs text-destructive">
                {errors.groupName.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="group-active"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <Label htmlFor="group-active" className="font-normal">
              {tl("thisGroupIsActive")}
            </Label>
          </div>

          <div className="mt-1 flex justify-end gap-2">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              {tl("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
