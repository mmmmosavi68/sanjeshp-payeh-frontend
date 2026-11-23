import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  description?: string;
  crumbs?: Crumb[];
};

export function PageHeader({
  title,
  description,
  crumbs = [],
}: PageHeaderProps) {
  const t = useTranslations("common");

  return (
    <header className="pb-4">
      <nav aria-label={t("breadcrumb")} className="mb-2">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center transition-colors hover:text-foreground"
            >
              <Home className="size-3.5" aria-hidden />
              <span className="sr-only">{t("home")}</span>
            </Link>
          </li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden />
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? "font-medium text-foreground" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}