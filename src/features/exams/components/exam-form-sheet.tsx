"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { createExam, updateExam } from "../api";

import type {
  CreateExamDto,
  ExamDto,
  ExamSessionOption,
} from "../types";

import { CODE_GROUPS } from "@/constants/codes";
import { SelectField } from "@/components/shared/select-field";
import { FormAlert } from "@/components/shared/form-alert";
import { useCodeOptions } from "@/features/codes/hooks/use-code-options";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: ExamDto | null;
  sessions: ExamSessionOption[];
  onSaved: () => void;
};

type FormValues = {
  title: string;
  examSessionId: string;
  examTypeKey: string;
  examModeKey: string;
  registrationStartDate: string;
  registrationEndDate: string;
  editStartDate: string;
  editEndDate: string;
  description: string;
  isActive: boolean;
};

const emptyValues: FormValues = {
  title: "",
  examSessionId: "",
  examTypeKey: "",
  examModeKey: "",
  registrationStartDate: "",
  registrationEndDate: "",
  editStartDate: "",
  editEndDate: "",
  description: "",
  isActive: true,
};

function toLocalInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ExamFormSheet({
  open,
  onOpenChange,
  exam,
  sessions,
  onSaved,
}: Props) {
  const examTypes = useCodeOptions(CODE_GROUPS.examType);
  const examModes = useCodeOptions(CODE_GROUPS.examMode);
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.exams.examFormSheet");
  const isEdit = exam !== null;

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (!exam) {
      setValues(emptyValues);
      return;
    }

    setValues({
      title: exam.title,
      examSessionId: exam.examSessionId,
      examTypeKey: exam.examTypeKey ?? "",
      examModeKey: exam.examModeKey ?? "",
      registrationStartDate: toLocalInput(exam.registrationStartDate),
      registrationEndDate: toLocalInput(exam.registrationEndDate),
      editStartDate: toLocalInput(exam.editStartDate),
      editEndDate: toLocalInput(exam.editEndDate),
      description: exam.description ?? "",
      isActive: exam.isActive,
    });
  }, [open, exam]);

  function setField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError(tl("enterTheExamTitle"));
      return;
    }

    if (!values.examSessionId) {
      setError(tl("selectTheExamSession"));
      return;
    }

    if (!values.examTypeKey || !values.examModeKey) {
      setError(tl("selectTheExamTypeAnd"));
      return;
    }

    if (!values.registrationStartDate || !values.registrationEndDate) {
      setError(tl("registrationStartAndEndDates"));
      return;
    }

    if (
      new Date(values.registrationEndDate) <
      new Date(values.registrationStartDate)
    ) {
      setError(tl("registrationEndCanTBe"));
      return;
    }

    if (Boolean(values.editStartDate) !== Boolean(values.editEndDate)) {
      setError(tl("forTheEditWindowEnter"));
      return;
    }

    if (
      values.editStartDate &&
      values.editEndDate &&
      new Date(values.editEndDate) < new Date(values.editStartDate)
    ) {
      setError(tl("editWindowEndCanT"));
      return;
    }

    const payload: CreateExamDto = {
      title: values.title.trim(),
      examSessionId: values.examSessionId,
      examTypeKey: values.examTypeKey,
      examModeKey: values.examModeKey,
      registrationStartDate: new Date(values.registrationStartDate).toISOString(),
      registrationEndDate: new Date(values.registrationEndDate).toISOString(),
      editStartDate: values.editStartDate
        ? new Date(values.editStartDate).toISOString()
        : null,
      editEndDate: values.editEndDate
        ? new Date(values.editEndDate).toISOString()
        : null,
      description: values.description.trim() || null,
    };

    setSubmitting(true);

    try {
      if (exam) {
        await updateExam(exam.id, {
          ...payload,
          isActive: values.isActive,
        });
        toast.success(tl("examUpdatedSuccessfully"));
      } else {
        await createExam(payload);
        toast.success(tl("examCreatedSuccessfully"));
      }

      onOpenChange(false);
      onSaved();
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : tl("couldnTSaveTheExam"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const sessionOptionsReady = sessions.length > 0;
  const codeOptionsReady = examTypes.loading || examModes.loading || (examTypes.options.length > 0 && examModes.options.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-4 py-3 pe-14">
          <SheetTitle>
            {isEdit ? tl("editExam") : tl("defineNewExam")}
          </SheetTitle>
          <SheetDescription>
            {tl("specifyTheExamDetailsAnd")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
            <FormAlert message={error} />

            {!sessionOptionsReady && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
                {tl("firstCreateAtLeastOne")}
              </div>
            )}

            {!codeOptionsReady && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
                {tl("theExamTypeAndDelivery")}
              </div>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold">{tl("mainInformation")}</h3>

              <FormField
                id="exam-title"
                label={tl("examTitle")}
                placeholder={tl("enterTheExamTitle2")}
                maxLength={200}
                value={values.title}
                onChange={(event) => setField("title", event.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label={tl("examSession")}
                  placeholder={tl("selectASession")}
                  options={sessions.map((item) => ({ value: item.id, label: `${item.title} - ${date(new Date(item.examDate))}` }))}
                  value={values.examSessionId || null}
                  onChange={(value) => setField("examSessionId", value)}
                />

                <SelectField
                  label={tl("examType")}
                  placeholder={tl("selectExamType")}
                  options={examTypes.options}
                  loading={examTypes.loading}
                  value={values.examTypeKey || null}
                  onChange={(value) => setField("examTypeKey", value)}
                />

                <SelectField
                  className="sm:col-span-2"
                  label={tl("deliveryMode")}
                  placeholder={tl("selectDeliveryMode")}
                  options={examModes.options}
                  loading={examModes.loading}
                  value={values.examModeKey || null}
                  onChange={(value) => setField("examModeKey", value)}
                />
              </div>
            </section>

            <section className="space-y-4 border-t pt-5">
              <h3 className="text-sm font-semibold">{tl("registrationWindow")}</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="registration-start"
                  label={tl("registrationStart")}
                  type="datetime-local"
                  value={values.registrationStartDate}
                  onChange={(event) => setField("registrationStartDate", event.target.value)}
                />

                <FormField
                  id="registration-end"
                  label={tl("registrationEnd")}
                  type="datetime-local"
                  value={values.registrationEndDate}
                  onChange={(event) => setField("registrationEndDate", event.target.value)}
                />
              </div>
            </section>

            <section className="space-y-4 border-t pt-5">
              <h3 className="text-sm font-semibold">{tl("informationEditWindowOptional")}</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="edit-start"
                  label={tl("editWindowStart")}
                  type="datetime-local"
                  value={values.editStartDate}
                  onChange={(event) => setField("editStartDate", event.target.value)}
                />

                <FormField
                  id="edit-end"
                  label={tl("editWindowEnd")}
                  type="datetime-local"
                  value={values.editEndDate}
                  onChange={(event) => setField("editEndDate", event.target.value)}
                />
              </div>
            </section>

            <section className="space-y-3 border-t pt-5">
              <h3 className="text-sm font-semibold">{tl("description")}</h3>
              <textarea
                value={values.description}
                onChange={(event) => setField("description", event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder={tl("additionalExamDescription")}
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />

              {isEdit && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.isActive}
                    onChange={(event) => setField("isActive", event.target.checked)}
                    className="size-4 accent-primary"
                  />
                  {tl("thisExamIsActive")}
                </label>
              )}
            </section>
          </div>

          <SheetFooter className="border-t px-4 py-4">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                {tl("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={
                  submitting ||
                  !sessionOptionsReady ||
                  !codeOptionsReady
                }
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? tl("saveChanges") : tl("createExam")}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}