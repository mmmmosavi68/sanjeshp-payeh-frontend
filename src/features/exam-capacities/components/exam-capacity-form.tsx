"use client";

import { Save } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/lib/format";

import type { UniversityExamCapacityExamDto } from "../types";
import { Chip } from "./capacity-chip";

export function ExamCapacityForm({
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
