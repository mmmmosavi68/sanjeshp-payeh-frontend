import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type FormAlertProps = { message: string | null | undefined; className?: string };

/** Inline server/validation error banner for forms and dialogs. */
export function FormAlert({ message, className }: FormAlertProps) {
  if (!message) return null;
  return (
    <div role="alert" className={cn("flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
