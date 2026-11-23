"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { PermissionProvider } from "@/features/permissions/permission-provider";
import { localeDirections } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import { AppHeader } from "./app-header";
import { Brand } from "./brand";
import { LogoutLink } from "./logout-link";
import { SidebarNav } from "./sidebar-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common");
  const tf = useTranslations("footer");
  const format = useFormatter();
  const locale = useLocale();
  const dir = localeDirections[locale] ?? "ltr";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const year = format.number(new Date().getFullYear(), { useGrouping: false });

  return (
    <PermissionProvider>
      <div className="min-h-dvh bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
        >
          {t("skipToContent")}
        </a>

        <AppHeader
          dir={dir}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Desktop sidebar */}
        <aside
          id="desktop-sidebar"
          className={cn(
            "fixed bottom-0 start-0 top-(--header-h) z-30 hidden flex-col overflow-hidden border-e bg-background transition-[width] duration-200 md:flex",
            collapsed ? "w-(--sidebar-w-collapsed)" : "w-(--sidebar-w)",
          )}
        >
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav collapsed={collapsed} />
          </div>
          <div className="border-t p-2">
            <LogoutLink collapsed={collapsed} />
          </div>
        </aside>

        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            id="mobile-sidebar"
            side={dir === "rtl" ? "right" : "left"}
            className="w-72! max-w-[85vw]! gap-0 p-0 sm:max-w-[85vw]!"
          >
            <SheetTitle className="sr-only">{t("menuTitle")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("menuDescription")}
            </SheetDescription>

            <div className="flex h-(--header-h) items-center border-b px-4 ltr:pe-14 rtl:ps-14">
              <Brand />
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t p-2">
              <LogoutLink onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Content */}
        <main
          id="main-content"
          className={cn(
            "flex min-h-dvh flex-col px-(--density-page-x) pt-[calc(var(--header-h)+var(--density-page-y))] transition-[padding] duration-200",
            collapsed
              ? "md:ps-[calc(var(--sidebar-w-collapsed)+var(--density-page-x))]"
              : "md:ps-[calc(var(--sidebar-w)+var(--density-page-x))]",
          )}
        >
          <div className="flex-1 pb-(--density-page-y)">{children}</div>
          <footer className="border-t py-3 text-xs text-muted-foreground">
            {tf.rich("rights", {
              year,
              name: t("appName"),
              companyName: t("company"),
              company: (chunks) => (
                <span className="font-semibold text-destructive">{chunks}</span>
              ),
            })}
          </footer>
        </main>
      </div>
    </PermissionProvider>
  );
}
