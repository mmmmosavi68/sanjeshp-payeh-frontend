"use client";

import { Pencil, RefreshCw, Save, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { SearchableSelect } from "@/components/shared/searchable-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatters } from "@/lib/format";

import { isElectronic } from "./capacity-utils";
import type { GuestCapacitiesState } from "./use-guest-capacities";

export function GuestCapacityDialog({ guest }: { guest: GuestCapacitiesState }) {
  const { num } = useFormatters();
  const tl = useTranslations("screens.examCapacities.examCapacityManager");
  const {
    guestDialogOpen, setGuestDialogOpen, guestExam, setGuestExam, guestCapacities, guestUniversities, guestLoading, guestSaving,
    guestUniversityId, setGuestUniversityId, guestCapacity, setGuestCapacity, guestLoadError, setGuestLoadError,
    loadGuestData, editGuestCapacity, handleSaveGuestCapacity,
  } = guest;

  return (
      
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

              
              <section className="space-y-3 rounded-lg border p-3">
                <h3 className="text-sm font-semibold">
                  {tl("addOrEditGuestCapacity")}
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    {tl("guestUniversity")}
                  </label>

                  <SearchableSelect<string>
                    aria-label={tl("guestUniversity")}
                    placeholder={tl("selectAUniversity")}
                    options={guestUniversities.map((university) => ({ value: String(university.id), label: university.title }))}
                    value={guestUniversityId || null}
                    onChange={setGuestUniversityId}
                    disabled={guestSaving}
                  />
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
  );
}
