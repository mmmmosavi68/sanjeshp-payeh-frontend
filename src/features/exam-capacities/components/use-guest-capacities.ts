"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useApiError } from "@/hooks/use-api-error";

import { listActiveGuestUniversities, listGuestCapacities, saveGuestCapacity } from "../api";
import type { GuestUniversityDto, UniversityExamCapacityExamDto, UniversityExamGuestCapacityDto } from "../types";

type Options = { universityId: string; onChanged: () => void };

/** State and actions of the guest-university capacity dialog. */
export function useGuestCapacities({ universityId, onChanged }: Options) {
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const { errorText } = useApiError();
  const reloadExams = onChanged;

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
        errorText(error, tl("couldnTLoadTheGuest")),
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
        errorText(error, tl("couldnTSaveTheGuest")),
      );
    } finally {
      setGuestSaving(false);
    }
  }

  return {
    guestDialogOpen,
    setGuestDialogOpen,
    guestExam,
    setGuestExam,
    guestCapacities,
    guestUniversities,
    guestLoading,
    guestSaving,
    guestUniversityId,
    setGuestUniversityId,
    guestCapacity,
    setGuestCapacity,
    guestLoadError,
    setGuestLoadError,
    loadGuestData,
    openGuestManager,
    editGuestCapacity,
    handleSaveGuestCapacity,
  };
}

export type GuestCapacitiesState = ReturnType<typeof useGuestCapacities>;
