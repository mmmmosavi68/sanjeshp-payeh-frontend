
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Clock,
  Pencil,
  Save,
  X,
  Users,
  RefreshCw,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/data-states";
import { useRemoteData } from "@/hooks/use-remote-data";

import {
  listMyCapacityUniversities,
  listUniversityActiveExams,
  saveUniversityExamCapacity,
  listActiveGuestUniversities,
  listGuestCapacities,
  saveGuestCapacity,
} from "../api";

import type {
  GuestUniversityDto,
  UniversityExamCapacityExamDto,
  UniversityExamGuestCapacityDto,
} from "../types";
import { useTranslations } from "next-intl";
import { useFormatters } from "@/lib/format";



const isElectronic = (exam?: UniversityExamCapacityExamDto) =>
  !!exam?.examModeTitle?.includes("الکترونیک");

/** تنظیمات نمایش لیست انتخاب */
const selectContentProps = {
  position: "popper" as const,
  align: "start" as const,
  sideOffset: 6,
  className: "max-h-72 w-[var(--radix-select-trigger-width)]",
};

export function ExamCapacityManager() {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const {
    data: universities,
    loading: universitiesLoading,
    failed: universitiesFailed,
    reload: reloadUniversities,
  } = useRemoteData("capacity-universities", listMyCapacityUniversities);

  const [universityId, setUniversityId] = useState("");

  const selectedUniversity = useMemo(
    () => universities?.find((item) => String(item.id) === universityId),
    [universities, universityId],
  );

  useEffect(() => {
    if (!universities?.length) return;

    if (universities.length === 1) {
      setUniversityId(String(universities[0].id));
    } else if (
      universityId &&
      !universities.some((item) => String(item.id) === universityId)
    ) {
      setUniversityId("");
    }
  }, [universities, universityId]);

  const {
    data: exams,
    loading: examsLoading,
    failed: examsFailed,
    reload: reloadExams,
  } = useRemoteData(`capacity-exams-${universityId}`, () =>
    universityId
      ? listUniversityActiveExams(Number(universityId))
      : Promise.resolve([]),
  );

  const definedExams = useMemo(
    () => exams?.filter((item) => item.isCapacityDefined) ?? [],
    [exams],
  );

  const availableExams = useMemo(
    () => exams?.filter((item) => !item.isCapacityDefined) ?? [],
    [exams],
  );

  const [examId, setExamId] = useState("");
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [allocatedCapacity, setAllocatedCapacity] = useState("");
  const [ownCapacity, setOwnCapacity] = useState("");
  const [saving, setSaving] = useState(false);

  const panelRef = useRef<HTMLElement>(null);

  const selectedExam = useMemo(
    () =>
      examsLoading
        ? undefined
        : exams?.find((item) => item.examId === (editingExamId ?? examId)),
    [exams, examsLoading, editingExamId, examId],
  );

  useEffect(() => {
    if (!exams || editingExamId) return;

    if (!availableExams.length) {
      setExamId("");
      return;
    }

    if (!examId || !availableExams.some((item) => item.examId === examId)) {
      setExamId(availableExams[0].examId);
    }
  }, [exams, availableExams, examId, editingExamId]);

  useEffect(() => {
    if (!selectedExam) {
      setAllocatedCapacity("");
      setOwnCapacity("");
      return;
    }

    setAllocatedCapacity(
      selectedExam.allocatedCapacity == null
        ? ""
        : String(selectedExam.allocatedCapacity),
    );

    setOwnCapacity(
      selectedExam.ownCapacity == null
        ? ""
        : String(selectedExam.ownCapacity),
    );
  }, [
    selectedExam?.examId,
    selectedExam?.allocatedCapacity,
    selectedExam?.ownCapacity,
  ]);

  // مجموع ظرفیت آزمون‌های الکترونیک با احتساب مقدار زنده فرم
  const electronicUsed = useMemo(() => {
    if (!selectedExam || !isElectronic(selectedExam)) return null;

    const others = definedExams
      .filter(
        (item) =>
          isElectronic(item) && item.examId !== selectedExam.examId,
      )
      .reduce(
        (sum, item) => sum + (item.allocatedCapacity ?? 0),
        0,
      );

    return others + (Number(allocatedCapacity) || 0);
  }, [selectedExam, definedExams, allocatedCapacity]);

  /* -------------------------------------------------------
     Host Capacity
  ------------------------------------------------------- */

  async function handleSave() {
    if (!universityId || !selectedExam) return;

    const allocated = Number(allocatedCapacity);
    const own = Number(ownCapacity);

    if (!Number.isInteger(allocated) || allocated <= 0) {
      toast.error(tl("totalCapacityMustBeA"));
      return;
    }

    if (!Number.isInteger(own) || own < 0) {
      toast.error(tl("dedicatedCapacityMustBeA"));
      return;
    }

    if (own > allocated) {
      toast.error(tl("dedicatedCapacityCanTExceed"));
      return;
    }

    setSaving(true);

    try {
      await saveUniversityExamCapacity(
        Number(universityId),
        selectedExam.examId,
        {
          allocatedCapacity: allocated,
          ownCapacity: own,
        },
      );

      toast.success(tl("examCapacitySavedSuccessfully"));

      setEditingExamId(null);
      setExamId("");

      reloadExams();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : tl("couldnTSaveTheExam"),
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(exam: UniversityExamCapacityExamDto) {
    setEditingExamId(exam.examId);
    setExamId("");

    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleCancelEdit() {
    setEditingExamId(null);
    setExamId("");
  }

  /* -------------------------------------------------------
     Guest Capacities State
  ------------------------------------------------------- */

  const [guestDialogOpen, setGuestDialogOpen] = useState(false);

  const [guestExam, setGuestExam] =
    useState<UniversityExamCapacityExamDto | null>(null);

  const [guestCapacities, setGuestCapacities] =
    useState<UniversityExamGuestCapacityDto[]>([]);

  const [guestUniversities, setGuestUniversities] =
    useState<GuestUniversityDto[]>([]);

  const [guestLoading, setGuestLoading] = useState(false);
  const [guestSaving, setGuestSaving] = useState(false);

  const [guestUniversityId, setGuestUniversityId] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");

  const [guestLoadError, setGuestLoadError] = useState("");

  /* -------------------------------------------------------
     Guest Capacities Functions
  ------------------------------------------------------- */

  async function loadGuestData(exam: UniversityExamCapacityExamDto) {
    if (!universityId) return;

    setGuestLoading(true);
    setGuestLoadError("");

    try {
      const [capacities, universities] = await Promise.all([
        listGuestCapacities(Number(universityId), exam.examId),
        listActiveGuestUniversities(),
      ]);

      setGuestCapacities(capacities);

      setGuestUniversities(
        universities.filter(
          (item) => item.id !== Number(universityId),
        ),
      );
    } catch (error) {
      setGuestLoadError(
        error instanceof Error && error.message
          ? error.message
          : tl("couldnTLoadTheGuest"),
      );
    } finally {
      setGuestLoading(false);
    }
  }

  async function openGuestManager(exam: UniversityExamCapacityExamDto) {
    setGuestExam(exam);
    setGuestUniversityId("");
    setGuestCapacity("");
    setGuestDialogOpen(true);

    await loadGuestData(exam);
  }

  function editGuestCapacity(item: UniversityExamGuestCapacityDto) {
    setGuestUniversityId(String(item.guestUniversityId));
    setGuestCapacity(String(item.capacity));
  }

  async function handleSaveGuestCapacity() {
    if (!universityId || !guestExam || !guestUniversityId) {
      toast.error(tl("selectAGuestUniversity"));
      return;
    }

    const capacity = Number(guestCapacity);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast.error(tl("capacityMustBeAWhole"));
      return;
    }

    setGuestSaving(true);

    try {
      await saveGuestCapacity(
        Number(universityId),
        guestExam.examId,
        Number(guestUniversityId),
        { capacity },
      );

      toast.success(tl("guestUniversityCapacitySavedSuccessfully"));

      setGuestUniversityId("");
      setGuestCapacity("");

      await loadGuestData(guestExam);
      reloadExams();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : tl("couldnTSaveTheGuest"),
      );
    } finally {
      setGuestSaving(false);
    }
  }

  /* -------------------------------------------------------
     General States
  ------------------------------------------------------- */

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
        description={tl("toSetExamCapacityUniversity")}
      />
    );
  }

  const isEditing = !!editingExamId;

  /* -------------------------------------------------------
     Main Page
  ------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-3">
      {/* نوار دانشگاه */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
        <div className="flex shrink-0 items-center gap-2 text-sm font-medium">
          <Building2 className="size-4 text-primary" />
          {tl("university")}
        </div>

        <div className="min-w-0 sm:w-72">
          {universities.length === 1 ? (
            <div className="flex h-9 items-center truncate rounded-md border bg-muted/40 px-3 text-sm">
              {universities[0].title}
            </div>
          ) : (
            <Select
              value={universityId}
              onValueChange={(value) => {
                setUniversityId(value);
                setExamId("");
                setEditingExamId(null);
              }}
            >
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue placeholder={tl("selectAUniversity")} />
              </SelectTrigger>

              <SelectContent {...selectContentProps}>
                {universities.map((university) => (
                  <SelectItem
                    key={university.id}
                    value={String(university.id)}
                  >
                    {university.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedUniversity && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {tl("type")}{" "}
              <b className="font-medium text-foreground">
                {selectedUniversity.universityTypeTitle || "—"}
              </b>
            </span>

            <span>
              {tl("approvedCapacity")}{" "}
              <b className="font-semibold tabular-nums text-foreground">
                {num(selectedUniversity.capacityApproved)}
              </b>
            </span>
          </div>
        )}

        {selectedUniversity && electronicUsed != null && (
          <CapacityUsage
            used={electronicUsed}
            approved={selectedUniversity.capacityApproved}
          />
        )}
      </div>

      {!universityId ? (
        <EmptyState
          icon={<Building2 className="size-5" />}
          title={tl("selectAUniversity")}
          description={tl("selectAUniversityToSee")}
        />
      ) : examsFailed ? (
        <ErrorState
          title={tl("couldnTLoadExams")}
          description={tl("theUniversitySExamList")}
          onRetry={reloadExams}
        />
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
          {/* پنل ثبت و ویرایش ظرفیت */}
          <section
            ref={panelRef}
            className={cn(
              "scroll-mt-4 overflow-hidden rounded-lg border bg-card transition-colors lg:sticky lg:top-4",
              isEditing && "border-warning/30",
            )}
          >
            <header
              className={cn(
                "flex items-center justify-between gap-2 border-b px-3 py-2.5 transition-colors",
                isEditing &&
                  "border-warning/30 bg-warning/10",
              )}
            >
              <h2
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  isEditing && "text-warning",
                )}
              >
                {isEditing && (
                  <span
                    className="size-2 rounded-full bg-warning"
                    aria-hidden
                  />
                )}

                {isEditing ? tl("editCapacity") : tl("addNewCapacity")}
              </h2>

              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs text-warning hover:bg-warning/10 hover:text-warning"
                  onClick={handleCancelEdit}
                >
                  <X className="size-3.5" />
                  {tl("cancel")}
                </Button>
              )}
            </header>

            <div className="space-y-3 p-3">
              {examsLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : isEditing && selectedExam ? (
                <p className="rounded-md bg-muted/40 px-3 py-2 text-sm font-medium">
                  {selectedExam.examTitle}
                </p>
              ) : availableExams.length ? (
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue placeholder={tl("selectAnExam")} />
                  </SelectTrigger>

                  <SelectContent {...selectContentProps}>
                    {availableExams.map((exam) => (
                      <SelectItem key={exam.examId} value={exam.examId}>
                        {exam.examTitle}
                        {exam.examSessionTitle
                          ? ` - ${exam.examSessionTitle}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="rounded-md bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">
                  {definedExams.length
                    ? tl("capacityHasBeenSetFor")
                    : tl("thereAreNoActiveExams")}
                </p>
              )}

              {selectedExam && (
                <ExamCapacityForm
                  exam={selectedExam}
                  allocatedCapacity={allocatedCapacity}
                  ownCapacity={ownCapacity}
                  onAllocatedChange={setAllocatedCapacity}
                  onOwnChange={setOwnCapacity}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
            </div>
          </section>

          {/* جدول ظرفیت‌های ثبت‌شده */}
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5">
              <h2 className="text-sm font-semibold">
                {tl("recordedCapacities")}
              </h2>

              {!examsLoading && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success">
                    <CheckCircle2 className="size-3.5" />
                    {tl("recorded")}
                    <b className="tabular-nums">
                      {num(definedExams.length)}
                    </b>
                  </span>

                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5",
                      availableExams.length
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Clock className="size-3.5" />
                    {tl("noCapacity")}
                    <b className="tabular-nums">
                      {num(availableExams.length)}
                    </b>
                  </span>
                </div>
              )}
            </header>

            {examsLoading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : definedExams.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {tl("noCapacityHasBeenRecorded")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-start font-medium">
                        {tl("exam")}
                      </th>

                      <th className="px-3 py-2 text-center font-medium">
                        {tl("total")}
                      </th>

                      <th className="px-3 py-2 text-center font-medium">
                        {tl("dedicated")}
                      </th>

                      <th className="hidden px-3 py-2 text-center font-medium sm:table-cell">
                        {tl("guest")}
                      </th>

                      <th className="px-2 py-2 text-center font-medium">
                        {tl("actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {definedExams.map((exam) => {
                      const guest =
                        (exam.allocatedCapacity ?? 0) -
                        (exam.ownCapacity ?? 0);

                      const active = editingExamId === exam.examId;

                      return (
                        <tr
                          key={exam.examId}
                          className={cn(
                            "border-b transition-colors last:border-0",
                            active
                              ? "bg-warning/10"
                              : "hover:bg-muted/30",
                          )}
                        >
                          <td className="px-3 py-2">
                            <div className="font-medium leading-5">
                              {exam.examTitle}
                            </div>

                            {exam.examSessionTitle && (
                              <div className="text-xs text-muted-foreground">
                                {exam.examSessionTitle}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-center tabular-nums">
                            {exam.allocatedCapacity != null
                              ? num(exam.allocatedCapacity)
                              : "—"}
                          </td>

                          <td className="px-3 py-2 text-center tabular-nums">
                            {exam.ownCapacity != null
                              ? num(exam.ownCapacity)
                              : "—"}
                          </td>

                          <td className="hidden px-3 py-2 text-center tabular-nums text-muted-foreground sm:table-cell">
                            {num(guest)}
                          </td>

                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 px-2 text-xs"
                                onClick={() => openGuestManager(exam)}
                              >
                                <Users className="size-3.5" />
                                <span className="hidden sm:inline">
                                  {tl("manageGuests")}
                                </span>
                                <span className="sm:hidden">
                                  {tl("guest")}
                                </span>
                              </Button>

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                aria-label={tl("editCapacityFor", { p0: exam.examTitle })}
                                onClick={() => handleEdit(exam)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* پنجره مدیریت دانشگاه‌های مهمان */}
      <Dialog
        open={guestDialogOpen}
        onOpenChange={(open) => {
          setGuestDialogOpen(open);

          if (!open) {
            setGuestExam(null);
            setGuestUniversityId("");
            setGuestCapacity("");
            setGuestLoadError("");
          }
        }}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[85vh] max-w-2xl overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              {tl("manageGuestUniversities")}
            </DialogTitle>

            <DialogDescription>
              {guestExam?.examTitle}
              {guestExam?.examSessionTitle
                ? ` - ${guestExam.examSessionTitle}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {guestLoading ? (
            <div className="space-y-3 py-3">
              <Skeleton className="h-(--density-control) w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-(--density-control) w-full" />
            </div>
          ) : guestLoadError ? (
            <div className="space-y-3 py-4">
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {guestLoadError}
              </p>

              {guestExam && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => loadGuestData(guestExam)}
                >
                  <RefreshCw className="me-2 size-4" />
                  {tl("tryAgain")}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* سقف ظرفیت مهمان */}
              {guestExam && isElectronic(guestExam) && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {tl("maximumAllowedGuestCapacity")}
                    </span>

                    <strong className="tabular-nums">
                      {num(
                        Math.max(
                          0,
                          (guestExam.allocatedCapacity ?? 0) -
                            (guestExam.ownCapacity ?? 0),
                        ),
                      )}
                    </strong>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {tl("theTotalCapacityOfGuest")}
                  </p>
                </div>
              )}

              {guestExam && !isElectronic(guestExam) && (
                <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  {tl("thisIsAPaperBased")}
                </p>
              )}

              {/* فرم ثبت یا ویرایش */}
              <section className="space-y-3 rounded-lg border p-3">
                <h3 className="text-sm font-semibold">
                  {tl("addOrEditGuestCapacity")}
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    {tl("guestUniversity")}
                  </label>

                  <Select
                    value={guestUniversityId}
                    onValueChange={setGuestUniversityId}
                    disabled={guestSaving}
                  >
                    <SelectTrigger className="h-(--density-control) w-full text-sm">
                      <SelectValue placeholder={tl("selectAUniversity")} />
                    </SelectTrigger>

                    <SelectContent {...selectContentProps}>
                      {guestUniversities.map((university) => (
                        <SelectItem
                          key={university.id}
                          value={String(university.id)}
                        >
                          {university.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="guest-capacity"
                    className="text-xs font-medium"
                  >
                    {tl("guestUniversityCapacity")}
                  </label>

                  <Input
                    id="guest-capacity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    className="h-(--density-control) tabular-nums"
                    placeholder={tl("capacity")}
                    value={guestCapacity}
                    onChange={(event) =>
                      setGuestCapacity(event.target.value)
                    }
                    disabled={guestSaving}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={
                      guestSaving ||
                      !guestUniversityId ||
                      !guestCapacity
                    }
                    onClick={handleSaveGuestCapacity}
                  >
                    <Save className="me-2 size-4" />
                    {guestSaving ? tl("saving") : tl("saveCapacity")}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={guestSaving}
                    onClick={() => {
                      setGuestUniversityId("");
                      setGuestCapacity("");
                    }}
                  >
                    {tl("clearForm")}
                  </Button>
                </div>
              </section>

              {/* فهرست دانشگاه‌های مهمان */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {tl("recordedGuestUniversities")}
                  </h3>

                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                    {num(guestCapacities.length)} {tl("university")}
                  </span>
                </div>

                {guestCapacities.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-8 text-center">
                    <Users className="mx-auto mb-2 size-7 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      {tl("noGuestUniversityHasBeen")}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                            <th className="px-3 py-2 text-start font-medium">
                              {tl("university")}
                            </th>

                            <th className="px-3 py-2 text-center font-medium">
                              {tl("capacity2")}
                            </th>

                            <th className="px-3 py-2 text-center font-medium">
                              {tl("status")}
                            </th>

                            <th className="px-2 py-2 text-center font-medium">
                              {tl("actions")}
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {guestCapacities.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b last:border-0 hover:bg-muted/30"
                            >
                              <td className="px-3 py-2 font-medium">
                                {item.guestUniversityTitle}
                              </td>

                              <td className="px-3 py-2 text-center tabular-nums">
                                {num(item.capacity)}
                              </td>

                              <td className="px-3 py-2 text-center">
                                <span
                                  className={
                                    item.isActive
                                      ? "text-xs text-success"
                                      : "text-xs text-muted-foreground"
                                  }
                                >
                                  {item.isActive ? tl("active") : tl("inactive")}
                                </span>
                              </td>

                              <td className="px-2 py-2 text-center">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="size-8"
                                  title={tl("editCapacity")}
                                  disabled={guestSaving}
                                  onClick={() => editGuestCapacity(item)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------
   Capacity Usage
--------------------------------------------------------- */

function CapacityUsage({
  used,
  approved,
}: {
  used: number;
  approved: number;
}) {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const free = approved - used;
  const over = free < 0;

  const pct =
    approved > 0 ? Math.min(100, (used / approved) * 100) : 0;

  return (
    <div className="w-full space-y-1 sm:min-w-56 sm:max-w-sm sm:flex-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {tl("electronicExamCapacity")}
        </span>

        <span className={cn("tabular-nums", over && "text-destructive")}>
          {num(used)} {tl("of")} {num(approved)}
        </span>
      </div>

      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={approved}
        aria-valuenow={used}
        aria-label={tl("approvedCapacityUtilization")}
      >
        <div
          className={cn(
            "transition-[width]",
            over ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />

        <div className={cn("flex-1", !over && "bg-primary/25")} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          {tl("filled")} <b className="tabular-nums">{num(used)}</b>
        </span>

        <span
          className={cn(
            "flex items-center gap-1.5",
            over && "text-destructive",
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              over ? "bg-destructive" : "bg-primary/25",
            )}
          />

          {over ? tl("overApproved") : tl("empty")}{" "}
          <b className="tabular-nums">{num(Math.abs(free))}</b>
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Host Capacity Form
--------------------------------------------------------- */

function ExamCapacityForm({
  exam,
  allocatedCapacity,
  ownCapacity,
  onAllocatedChange,
  onOwnChange,
  onSave,
  saving,
}: {
  exam: UniversityExamCapacityExamDto;
  allocatedCapacity: string;
  ownCapacity: string;
  onAllocatedChange: (value: string) => void;
  onOwnChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const { num, date } = useFormatters();
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const allocated = Number(allocatedCapacity || 0);
  const own = Number(ownCapacity || 0);

  const guest = allocated - own;
  const invalid = guest < 0;

  const ownPct =
    allocated > 0
      ? Math.min(100, Math.max(0, (own / allocated) * 100))
      : 0;

  const canSave =
    !saving &&
    !!allocatedCapacity &&
    !!ownCapacity &&
    allocated > 0 &&
    own >= 0 &&
    own <= allocated;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (canSave) onSave();
      }}
    >
      <div className="flex flex-wrap gap-1.5 text-xs">
        <Chip label={tl("session")} value={exam.examSessionTitle || "—"} />
        <Chip label={tl("type2")} value={exam.examModeTitle || "—"} />

        <Chip
          label={tl("date")}
          value={
            exam.examDate
              ? date(new Date(exam.examDate))
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label htmlFor="allocated" className="text-xs font-medium">
            {tl("totalCapacity")}
          </label>

          <Input
            id="allocated"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="h-9 tabular-nums"
            value={allocatedCapacity}
            onChange={(event) =>
              onAllocatedChange(event.target.value)
            }
            disabled={saving}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="own" className="text-xs font-medium">
            {tl("dedicatedCapacity")}
          </label>

          <Input
            id="own"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className="h-9 tabular-nums"
            value={ownCapacity}
            onChange={(event) =>
              onOwnChange(event.target.value)
            }
            disabled={saving}
          />
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5">
        <div
          className="flex h-2 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={tl("dedicatedToTotalCapacityRatio")}
        >
          <div
            className="bg-primary transition-[width]"
            style={{ width: `${ownPct}%` }}
          />

          <div className="flex-1 bg-primary/25" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            {tl("dedicated")}
            <b className="tabular-nums">{num(own)}</b>
          </span>

          <span
            className={cn(
              "flex items-center gap-1.5",
              invalid && "text-destructive",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                invalid ? "bg-destructive" : "bg-primary/25",
              )}
            />

            {tl("guest")}
            <b className="tabular-nums">{num(guest)}</b>
          </span>
        </div>

        {invalid && (
          <p className="text-xs text-destructive">
            {tl("dedicatedCapacityCanTExceed")}
          </p>
        )}
      </div>

      <Button type="submit" disabled={!canSave} className="h-9 w-full">
        <Save className="me-2 size-4" />
        {saving ? tl("saving") : tl("saveCapacity")}
      </Button>
    </form>
  );
}

/* ---------------------------------------------------------
   Small Components
--------------------------------------------------------- */

function Chip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="rounded-md border bg-muted/30 px-2 py-1 text-muted-foreground">
      {label}:{" "}
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}
