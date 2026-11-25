"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

import { firstFieldErrors, resolveErrorMessage, type Translator } from "@/lib/api/error-message";

/** Single entry point for presenting API errors (inline text, toast, per-field errors) in the current language. */
export function useApiError() {
  const t = useTranslations();

  const errorText = useCallback(
    (error: unknown, fallback?: string) => resolveErrorMessage(error, t as unknown as Translator, fallback),
    [t],
  );

  const notifyError = useCallback(
    (error: unknown, fallback?: string) => {
      toast.error(errorText(error, fallback));
    },
    [errorText],
  );

  return { errorText, notifyError, fieldErrors: firstFieldErrors };
}
