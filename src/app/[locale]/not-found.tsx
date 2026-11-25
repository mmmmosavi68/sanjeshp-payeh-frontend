import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors.page");

  return (
    <div className="mx-auto flex min-h-[50dvh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-extrabold text-muted-foreground" aria-hidden>
        404
      </p>
      <h1 className="text-lg font-semibold">{t("notFoundTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
      <Link href="/dashboard" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        {t("backHome")}
      </Link>
    </div>
  );
}
