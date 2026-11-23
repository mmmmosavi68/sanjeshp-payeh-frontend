import { ShieldAlert } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("errors.forbidden");

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4">
      <section className="surface w-full max-w-md animate-page-in p-8 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-8" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "mt-6" })}>
          {t("back")}
        </Link>
      </section>
    </main>
  );
}
