import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type StatusBadgeProps = { active: boolean; className?: string };

/** Active / inactive pill used by every table. */
export function StatusBadge({ active, className }: StatusBadgeProps) {
  const t = useTranslations("common.status");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {active ? t("active") : t("inactive")}
    </span>
  );
}
