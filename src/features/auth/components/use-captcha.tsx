"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCaptcha } from "../api";
import { toLatinDigits } from "@/lib/digits";
import type { AuthConfig, CaptchaImage } from "@/types/auth";

export function useCaptcha(config: AuthConfig) {
  const t = useTranslations("auth.captcha");
  const [challenge, setChallenge] = useState<CaptchaImage | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    if (!config.captchaEnabled) return;
    setLoading(true);
    setFailed(false);
    setCode("");
    try {
      setChallenge(await getCaptcha());
    } catch {
      setChallenge(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [config.captchaEnabled]);

useEffect(() => {
  const timerId = window.setTimeout(() => {
    void refresh();
  }, 0);

  return () => {
    window.clearTimeout(timerId);
  };
}, [refresh]);

  const token = challenge && code.trim() ? `${challenge.captchaId}:${code.trim()}` : null;
  const element = config.captchaEnabled ? (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-3" dir="ltr">
      <div className="flex items-center gap-3">
        {challenge ? <img alt={t("imageAlt")} src={`data:${challenge.contentType};base64,${challenge.imageBase64}`} className="h-14 w-36 rounded-md border bg-white object-contain" /> : <div className="grid h-14 w-36 place-items-center rounded-md border bg-background text-xs text-muted-foreground">{loading ? t("loading") : t("unavailable")}</div>}
        <Button type="button" variant="outline" size="icon" aria-label={t("refresh")} onClick={() => void refresh()} disabled={loading}><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /></Button>
      </div>
      <label htmlFor="captcha-code" className="text-xs font-medium">{t("label")}</label>
      <Input id="captcha-code" value={code} onChange={(event) => setCode(toLatinDigits(event.target.value).replace(/\D/g, "").slice(0, 8))} autoComplete="off" inputMode="numeric" maxLength={8} placeholder={t("placeholder")} disabled={!challenge || loading} />
      {failed ? <p role="alert" className="text-xs text-destructive ">{t("failed")}</p> : null}
    </div>
  ) : null;

  return { enabled: config.captchaEnabled, token, reset: refresh, element };
}
