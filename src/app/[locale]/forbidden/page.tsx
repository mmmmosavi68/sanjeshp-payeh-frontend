import { getLocale } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function ForbiddenPage() {
  const locale = await getLocale(); const fa = locale === "fa";
  return <main className="grid min-h-dvh place-items-center bg-background p-4"><section className="w-full max-w-md rounded-lg border bg-card p-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="size-7"/></span><h1 className="mt-4 text-2xl font-semibold">{fa ? "دسترسی غیرمجاز" : "Access denied"}</h1><p className="mt-2 text-sm text-muted-foreground">{fa ? "برای مشاهده این بخش مجوز لازم را ندارید. در صورت نیاز با مدیر سامانه تماس بگیرید." : "You do not have permission to view this page. Contact your system administrator if you need access."}</p><Link href="/dashboard" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">{fa ? "بازگشت به داشبورد" : "Back to dashboard"}</Link></section></main>;
}
