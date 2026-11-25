
"use client";

import { useApiError } from "@/hooks/use-api-error";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createExamRegistration,
  getExamRegistration,
  getExamRegistrationOptions,
  updateExamRegistration,
} from "../api";

import type {
  CreateExamRegistrationInput,
  UpdateExamRegistrationInput,
} from "../api";
import type {
  ExamRegistrationCapacityOptionDto,
  ExamRegistrationOptionsDto,
} from "../types";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  universityId: number;
  registrationId?: string | null;
  onSaved: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  fatherName: string;
  nationalCode: string;
  genderId: string;
  birthCertificateNumber: string;
  birthDate: string;
  studentNumber: string;
  entryYear: string;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  capacityId: string;
}

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  fatherName: "",
  nationalCode: "",
  genderId: "",
  birthCertificateNumber: "",
  birthDate: "",
  studentNumber: "",
  entryYear: "",
  phoneNumber: "",
  emergencyPhoneNumber: "",
  capacityId: "",
};

const selectContentProps = {
  position: "popper" as const,
  align: "start" as const,
  sideOffset: 6,
  className: "max-h-72 w-[var(--radix-select-trigger-width)]",
};

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

export function StudentRegistrationFormDialog({
  open,
  onOpenChange,
  examId,
  universityId,
  registrationId,
  onSaved,
}: Props) {
  const tl = useTranslations("screens.studentRegistrations.studentRegistrationFormDialog");
  const { errorText } = useApiError();
  const isEdit = !!registrationId;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [options, setOptions] = useState<ExamRegistrationOptionsDto | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setOptions(null);
      setForm(emptyForm);

      try {
        const [registrationOptions, registration] = await Promise.all([
          getExamRegistrationOptions(examId, universityId),
          registrationId
            ? getExamRegistration(registrationId)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setOptions(registrationOptions);

        if (registration) {
          setForm({
            firstName: registration.firstName,
            lastName: registration.lastName,
            fatherName: registration.fatherName ?? "",
            nationalCode: registration.nationalCode,
            genderId:
              registration.genderId != null
                ? String(registration.genderId)
                : "",
            birthCertificateNumber:
              registration.birthCertificateNumber ?? "",
            birthDate: registration.birthDate
              ? registration.birthDate.substring(0, 10)
              : "",
            studentNumber: registration.studentNumber ?? "",
            entryYear:
              registration.entryYear != null
                ? String(registration.entryYear)
                : "",
            phoneNumber: registration.phoneNumber ?? "",
            emergencyPhoneNumber:
              registration.emergencyPhoneNumber ?? "",
            capacityId: registration.universityExamCapacityId,
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            errorText(error, tl("couldnTLoadTheForm")),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [open, examId, universityId, registrationId]);

  const selectedCapacity: ExamRegistrationCapacityOptionDto | undefined =
    options?.capacities.find(
      (item) => item.universityExamCapacityId === form.capacityId,
    );

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCapacity) {
      toast.error(tl("selectTheExamVenueUniversity"));
      return;
    }

    if (!/^\d{10}$/.test(form.nationalCode.trim())) {
      toast.error(tl("nationalIdMustBeExactly"));
      return;
    }

    const commonData = {
      universityId,
      examVenueUniversityId: selectedCapacity.examVenueUniversityId,
      universityExamCapacityId: selectedCapacity.universityExamCapacityId,
      universityExamGuestCapacityId:
        selectedCapacity.universityExamGuestCapacityId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fatherName: toNullable(form.fatherName),
      nationalCode: form.nationalCode.trim(),
      genderId: form.genderId ? Number(form.genderId) : null,
      birthCertificateNumber: toNullable(form.birthCertificateNumber),
      birthDate: form.birthDate || null,
      studentNumber: toNullable(form.studentNumber),
      entryYear: form.entryYear ? Number(form.entryYear) : null,
      phoneNumber: toNullable(form.phoneNumber),
      emergencyPhoneNumber: toNullable(form.emergencyPhoneNumber),
      customFieldValues: [],
    };

    setSaving(true);

    try {
      if (registrationId) {
        const input: UpdateExamRegistrationInput = commonData;
        await updateExamRegistration(registrationId, input);
        toast.success(tl("candidateDetailsUpdatedSuccessfully"));
      } else {
        const input: CreateExamRegistrationInput = {
          ...commonData,
          examId,
        };
        await createExamRegistration(input);
        toast.success(tl("candidateRegisteredSuccessfully"));
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        errorText(error, tl("couldnTSaveTheCandidate")),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? tl("editCandidateDetails") : tl("registerNewCandidate")}
          </DialogTitle>
          <DialogDescription>
            {tl("enterTheCandidateSDetails")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          </div>
        ) : !options ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            {tl("couldnTLoadTheForm2")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={tl("firstName")} required>
                <Input
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  maxLength={50}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label={tl("lastName")} required>
                <Input
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  maxLength={50}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label={tl("fatherSName")}>
                <Input
                  value={form.fatherName}
                  onChange={(e) => updateField("fatherName", e.target.value)}
                  maxLength={50}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("nationalId")} required>
                <Input
                  dir="ltr"
                  inputMode="numeric"
                  value={form.nationalCode}
                  onChange={(e) =>
                    updateField(
                      "nationalCode",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  maxLength={10}
                  required
                  disabled={saving}
                />
              </Field>

              <Field label={tl("gender")}>
                <Select
                  value={form.genderId}
                  onValueChange={(value) => updateField("genderId", value)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tl("selectGender")} />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="34">{tl("male")}</SelectItem>
                    <SelectItem value="35">{tl("female")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label={tl("birthCertificateNumber")}>
                <Input
                  value={form.birthCertificateNumber}
                  onChange={(e) =>
                    updateField("birthCertificateNumber", e.target.value)
                  }
                  maxLength={20}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("dateOfBirth")}>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("studentNumber")}>
                <Input
                  value={form.studentNumber}
                  onChange={(e) =>
                    updateField("studentNumber", e.target.value)
                  }
                  maxLength={30}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("entryYear")}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1300}
                  max={1500}
                  value={form.entryYear}
                  onChange={(e) => updateField("entryYear", e.target.value)}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("phoneNumber")}>
                <Input
                  dir="ltr"
                  inputMode="tel"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  maxLength={20}
                  disabled={saving}
                />
              </Field>

              <Field label={tl("emergencyPhoneNumber")}>
                <Input
                  dir="ltr"
                  inputMode="tel"
                  value={form.emergencyPhoneNumber}
                  onChange={(e) =>
                    updateField("emergencyPhoneNumber", e.target.value)
                  }
                  maxLength={20}
                  disabled={saving}
                />
              </Field>
            </section>

            <section className="space-y-2 rounded-lg border p-3">
              <h3 className="text-sm font-semibold">
                {tl("examVenueUniversity")}
              </h3>

              <Select
                value={form.capacityId}
                onValueChange={(value) => updateField("capacityId", value)}
                disabled={saving || options.capacities.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tl("selectTheExamVenueUniversity2")} />
                </SelectTrigger>

                <SelectContent {...selectContentProps}>
                  {options.capacities.map((capacity) => (
                    <SelectItem
                      key={capacity.universityExamCapacityId}
                      value={capacity.universityExamCapacityId}
                    >
                      {capacity.examVenueUniversityTitle}
                      {capacity.isOwnUniversity ? tl("mainUniversity") : tl("guest")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCapacity && (
                <p className="text-xs text-muted-foreground">
                  {selectedCapacity.isOwnUniversity
                    ? tl("mainUniversityCapacityIsSelected")
                    : tl("guestCapacity", { p0: selectedCapacity.guestCapacity ?? "—" })}
                </p>
              )}

              {options.capacities.length === 0 && (
                <p className="text-xs text-destructive">
                  {tl("noSelectableCapacityIsDefined")}
                </p>
              )}
            </section>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                {tl("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={saving || options.capacities.length === 0}
              >
                {saving ? (
                  <Loader2 className="me-2 size-4 animate-spin" />
                ) : (
                  <Save className="me-2 size-4" />
                )}
                {saving ? tl("saving") : tl("saveDetails")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">
        {label}
        {required && <span className="ms-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
