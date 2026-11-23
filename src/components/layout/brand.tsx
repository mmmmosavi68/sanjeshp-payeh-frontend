import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BrandProps = {
  /** فقط نشان (برای سایدبار جمع‌شده) */
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className }: BrandProps) {
  const t = useTranslations("common");

  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      aria-label={t("appName")}
    >
      <Image
        src="/logo.png"
        width={36}
        height={36}
        alt={t("logoAlt")}
        className="size-9 shrink-0 rounded-lg object-contain"
      />
      <span className={cn("truncate text-base tracking-tight", compact && "sr-only")}>
        {t("appName")}
      </span>
    </Link>
  );
}
