import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type LoadingStateProps = { label?: string; className?: string };

export function LoadingState({ label, className }: LoadingStateProps) {
  const t = useTranslations("common");
  return (
    <div role="status" aria-live="polite" className={cn("px-4 py-10 text-center", className)}>
      <div className="mx-auto mb-2 size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      <p className="text-xs text-muted-foreground">{label ?? t("loading")}</p>
    </div>
  );
}
