
"use client";

import { useApiError } from "@/hooks/use-api-error";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  GraduationCap,
  RefreshCw,
  Trash2,
  Users,
  UserPlus,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { useRemoteData } from "@/hooks/use-remote-data";

import {
  listRegistrationUniversities,
  listRegistrationExams,
  listExamRegistrations,
  deleteExamRegistration,
} from "../api";

import type { ExamRegistrationDto } from "../types";
import { StudentRegistrationFormDialog } from "./student-registration-form-dialog";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";



const selectContentProps = {
  position: "popper" as const,
  align: "start" as const,
  sideOffset: 6,
  className: "max-h-72 w-[var(--radix-select-trigger-width)]",
};

export function StudentRegistrationManager() {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.studentRegistrations.studentRegistrationManager");
  const { errorText } = useApiError();
  const {
    data: universities,
    loading: universitiesLoading,
    failed: universitiesFailed,
    reload: reloadUniversities,
  } = useRemoteData(
    "registration-universities",
    listRegistrationUniversities,
  );

  const [universityId, setUniversityId] = useState("");
  const [examId, setExamId] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRegistrationId, setEditingRegistrationId] =
    useState<string | null>(null);

  const selectedUniversity = useMemo(
    () =>
      universities?.find(
        (item) => String(item.universityId) === universityId,
      ),
    [universities, universityId],
  );

  useEffect(() => {
    if (!universities?.length) return;

    if (universities.length === 1) {
      setUniversityId(String(universities[0].universityId));
      return;
    }

    if (
      universityId &&
      !universities.some(
        (item) => String(item.universityId) === universityId,
      )
    ) {
      setUniversityId("");
    }
  }, [universities, universityId]);

  const {
    data: exams,
    loading: examsLoading,
    failed: examsFailed,
    reload: reloadExams,
  } = useRemoteData(
    `registration-exams-${universityId}`,
    () =>
      universityId
        ? listRegistrationExams(Number(universityId))
        : Promise.resolve([]),
  );

  useEffect(() => {
    if (!exams) return;

    if (!exams.some((item) => item.examId === examId)) {
      setExamId(exams[0]?.examId ?? "");
    }
  }, [exams, examId]);

  const selectedExam = useMemo(
    () => exams?.find((item) => item.examId === examId),
    [exams, examId],
  );

  const {
    data: registrations,
    loading: registrationsLoading,
    failed: registrationsFailed,
    reload: reloadRegistrations,
  } = useRemoteData(
    `registrations-${universityId}-${examId}`,
    () =>
      universityId && examId
        ? listExamRegistrations(examId, Number(universityId))
        : Promise.resolve([]),
  );

  function openCreateForm() {
    setEditingRegistrationId(null);
    setFormOpen(true);
  }

  function openEditForm(id: string) {
    setEditingRegistrationId(id);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);

    if (!open) {
      setEditingRegistrationId(null);
    }
  }

  async function handleDelete(item: ExamRegistrationDto) {
    const fullName = `${item.firstName} ${item.lastName}`;

    if (
      !window.confirm(
        tl("areYouSureYouWant", { fullName }),
      )
    ) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteExamRegistration(item.id);
      toast.success(tl("candidateRegistrationDeletedSuccessfully"));
      reloadRegistrations();
    } catch (error) {
      toast.error(
        errorText(error, tl("couldnTDeleteTheRegistration")),
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (universitiesLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (universitiesFailed) {
    return (
      <ErrorState
        title={tl("couldnTLoadUniversities")}
        description={tl("couldnTLoadTheList")}
        onRetry={reloadUniversities}
      />
    );
  }

  if (!universities?.length) {
    return (
      <EmptyState
        icon={<Building2 className="size-5" />}
        title={tl("noUniversitiesAssignedToYou")}
        description={tl("toRegisterStudentsUniversityAccess")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* انتخاب دانشگاه و آزمون */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-64">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Building2 className="size-4" />
            {tl("homeUniversity")}
          </label>

          {universities.length === 1 ? (
            <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">
              {universities[0].universityTitle}
            </div>
          ) : (
            <Select
              value={universityId}
              onValueChange={(value) => {
                setUniversityId(value);
                setExamId("");
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={tl("selectAUniversity")} />
              </SelectTrigger>

              <SelectContent {...selectContentProps}>
                {universities.map((university) => (
                  <SelectItem
                    key={university.universityId}
                    value={String(university.universityId)}
                  >
                    {university.universityTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-64">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GraduationCap className="size-4" />
            {tl("exam")}
          </label>

          <Select
            value={examId}
            onValueChange={setExamId}
            disabled={!universityId || examsLoading || !exams?.length}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue
                placeholder={
                  !universityId
                    ? tl("selectAUniversityFirst")
                    : examsLoading
                      ? tl("loadingExams")
                      : tl("selectAnExam")
                }
              />
            </SelectTrigger>

            <SelectContent {...selectContentProps}>
              {exams?.map((exam) => (
                <SelectItem key={exam.examId} value={exam.examId}>
                  {exam.examTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-9"
            disabled={!universityId || examsLoading}
            onClick={() => {
              reloadExams();
              reloadRegistrations();
            }}
          >
            <RefreshCw className="size-4" />
            {tl("refresh")}
          </Button>
        </div>
      </section>

      {!universityId ? (
        <EmptyState
          icon={<Building2 className="size-5" />}
          title={tl("selectAUniversity")}
          description={tl("selectAUniversityToSee")}
        />
      ) : examsFailed ? (
        <ErrorState
          title={tl("couldnTLoadExams")}
          description={tl("couldnTLoadTheList2")}
          onRetry={reloadExams}
        />
      ) : examsLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : !exams?.length ? (
        <EmptyState
          icon={<GraduationCap className="size-5" />}
          title={tl("noExamsOpenForRegistration")}
          description={tl("thereAreCurrentlyNoExams")}
        />
      ) : !examId ? (
        <EmptyState
          icon={<GraduationCap className="size-5" />}
          title={tl("selectAnExam")}
          description={tl("selectAnExamToView")}
        />
      ) : (
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-3">
            <div className="min-w-0 space-y-1">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4 text-primary" />
                {tl("studentRegistrations")}
              </h2>

              <p className="truncate text-xs text-muted-foreground">
                {selectedUniversity?.universityTitle}
                {" / "}
                {selectedExam?.examTitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!registrationsLoading && registrations && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {num(registrations.length)} {tl("candidate")}
                </span>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={reloadRegistrations}
                disabled={registrationsLoading}
              >
                <RefreshCw className="size-3.5" />
                {tl("refresh")}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={openCreateForm}
              >
                <UserPlus className="me-2 size-4" />
                {tl("newRegistration")}
              </Button>
            </div>
          </header>

          {registrationsLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : registrationsFailed ? (
            <div className="p-3">
              <ErrorState
                title={tl("couldnTLoadRegistrations")}
                description={tl("theCandidateListForThis")}
                onRetry={reloadRegistrations}
              />
            </div>
          ) : !registrations?.length ? (
            <EmptyState
              icon={<Users className="size-5" />}
              title={tl("noRegistrations")}
              description={tl("noCandidateHasRegisteredFor")}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{tl("no")}</TableHead>
                  <TableHead className="text-start">
                    {tl("fullName")}
                  </TableHead>
                  <TableHead className="text-start">{tl("nationalId")}</TableHead>
                  <TableHead className="text-start">
                    {tl("studentNumber")}
                  </TableHead>
                  <TableHead className="text-start">
                    {tl("examVenueUniversity")}
                  </TableHead>
                  <TableHead className="text-start">{tl("registeredOn")}</TableHead>
                  <TableHead className="text-center">{tl("actions")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {registrations.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-start tabular-nums">
                      {num(index + 1)}
                    </TableCell>

                    <TableCell className="font-medium">
                      {item.firstName} {item.lastName}
                    </TableCell>

                    <TableCell className="font-mono text-xs" dir="ltr">
                      {item.nationalCode}
                    </TableCell>

                    <TableCell>
                      {item.studentNumber || "—"}
                    </TableCell>

                    <TableCell>
                      {item.examVenueUniversityTitle || "—"}
                    </TableCell>

                    <TableCell className="tabular-nums">
                      {item.createdDate
                        ? date(new Date(item.createdDate))
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          title={tl("editDetails")}
                          onClick={() => openEditForm(item.id)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          title={tl("deleteRegistration")}
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      )}

      {selectedUniversity && selectedExam && (
        <StudentRegistrationFormDialog
          open={formOpen}
          onOpenChange={handleFormOpenChange}
          examId={selectedExam.examId}
          universityId={selectedUniversity.universityId}
          registrationId={editingRegistrationId}
          onSaved={reloadRegistrations}
        />
      )}
    </div>
  );
}
