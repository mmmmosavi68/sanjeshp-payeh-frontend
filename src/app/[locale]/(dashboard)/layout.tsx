import { cookies } from "next/headers";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "@/i18n/navigation";
import { COOKIE } from "@/lib/auth/cookie-names";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // دفاع در عمق: علاوه بر proxy، خود لایه‌ی سرور هم نبودِ نشست را رد می‌کند.
  // اعتبار واقعی توکن و مجوزها همیشه در backend (از مسیر BFF) اعمال می‌شود، نه سمت کلاینت.
  if (!(await cookies()).has(COOKIE.session)) {
    redirect({ href: "/login", locale });
  }

  return <DashboardShell>{children}</DashboardShell>;
}
