"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  createExamSession,
  updateExamSession,
} from "../api";

import type { ExamSessionDto } from "../types";
import { useTranslations } from "next-intl";

const examSessionFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "titleRequired")
      .max(100, "titleTooLong"),

    examDate: z.string().min(1, "dateRequired"),

    startTime: z.string().min(1, "startRequired"),

    endTime: z.string().min(1, "endRequired"),

    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (
      value.startTime &&
      value.endTime &&
      value.endTime <= value.startTime
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "endAfterStart",
      });
    }
  });

type ExamSessionFormInput = z.input<typeof examSessionFormSchema>;
type ExamSessionFormValues = z.output<typeof examSessionFormSchema>;

type ExamSessionFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examSession: ExamSessionDto | null;
  onSaved: () => void;
};

const emptyValues: ExamSessionFormInput = {
  title: "",
  examDate: "",
  startTime: "08:00",
  endTime: "12:00",
  isActive: true,
};

const inputClassName =
  "h-(--density-control) w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function getDateValue(value: string): string {
  return value.slice(0, 10);
}

function getTimeValue(value: string): string {
  return value.slice(0, 5);
}

export function ExamSessionFormSheet({
  open,
  onOpenChange,
  examSession,
  onSaved,
}: ExamSessionFormSheetProps) {
  const tl = useTranslations("screens.examSessions.examSessionFormSheet");
  const isEdit = examSession !== null;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExamSessionFormInput, unknown, ExamSessionFormValues>({
    resolver: zodResolver(examSessionFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;

    setFormError(null);

    if (examSession) {
      reset({
        title: examSession.title,
        examDate: getDateValue(examSession.examDate),
        startTime: getTimeValue(examSession.startTime),
        endTime: getTimeValue(examSession.endTime),
        isActive: examSession.isActive,
      });
    } else {
      reset(emptyValues);
    }
  }, [open, examSession, reset]);

  async function onSubmit(values: ExamSessionFormValues) {
    setFormError(null);

    const payload = {
      title: values.title.trim(),
      examDate: `${values.examDate}T00:00:00`,
      startTime: `${values.startTime}:00`,
      endTime: `${values.endTime}:00`,
    };

    try {
      if (examSession) {
        await updateExamSession(examSession.id, {
          ...payload,
          isActive: values.isActive,
        });

        toast.success(tl("examSessionUpdatedSuccessfully"));
      } else {
        await createExamSession(payload);

        toast.success(tl("examSessionCreatedSuccessfully"));
      }

      onOpenChange(false);
      onSaved();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : tl("couldnTSaveTheExam"),
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-4 py-3 pe-14">
          <SheetTitle>
            {isEdit ? tl("editExamSession") : tl("createNewExamSession")}
          </SheetTitle>

          <SheetDescription>
            {tl("specifyTheTitleDateAnd")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold">
                {tl("sessionDetails")}
              </h3>

              <div className="flex flex-col gap-2">
                <label htmlFor="exam-session-title" className="text-sm font-medium">
                  {tl("sessionTitle")}
                </label>

                <input
                  id="exam-session-title"
                  type="text"
                  maxLength={100}
                  placeholder={tl("eGMorningSessionOf")}
                  className={inputClassName}
                  {...register("title")}
                />

                {errors.title?.message && (
                  <p className="text-xs text-destructive">
                    {tl(`validation.${errors.title.message}`)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="exam-session-date" className="text-sm font-medium">
                  {tl("examDate")}
                </label>

                <input
                  id="exam-session-date"
                  type="date"
                  className={inputClassName}
                  {...register("examDate")}
                />

                {errors.examDate?.message && (
                  <p className="text-xs text-destructive">
                    {tl(`validation.${errors.examDate.message}`)}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="exam-session-start" className="text-sm font-medium">
                    {tl("startTime")}
                  </label>

                  <input
                    id="exam-session-start"
                    type="time"
                    className={inputClassName}
                    {...register("startTime")}
                  />

                  {errors.startTime?.message && (
                    <p className="text-xs text-destructive">
                      {tl(`validation.${errors.startTime.message}`)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="exam-session-end" className="text-sm font-medium">
                    {tl("endTime")}
                  </label>

                  <input
                    id="exam-session-end"
                    type="time"
                    className={inputClassName}
                    {...register("endTime")}
                  />

                  {errors.endTime?.message && (
                    <p className="text-xs text-destructive">
                      {tl(`validation.${errors.endTime.message}`)}
                    </p>
                  )}
                </div>
              </div>

              {isEdit && (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    {...register("isActive")}
                  />

                  <span className="text-sm">
                    {tl("thisExamSessionIsActive")}
                  </span>
                </label>
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
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}

                {isEdit ? tl("saveChanges") : tl("createSession")}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}