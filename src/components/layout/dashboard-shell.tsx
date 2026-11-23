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
import { SidebarNav } from "./sidebar-nav";
import { SidebarProfile } from "./sidebar-profile";

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
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg"
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

        {/* Desktop sidebar: تمام‌قد، با نشان در بالا و پروفایل در پایین */}
        <aside
          id="desktop-sidebar"
          className={cn(
            "fixed inset-y-0 start-0 z-40 hidden flex-col overflow-hidden border-e bg-card transition-[width] duration-200 ease-out md:flex",
            collapsed ? "w-(--sidebar-w-collapsed)" : "w-(--sidebar-w)",
          )}
        >
          <div
            className={cn(
              "flex h-(--header-h) shrink-0 items-center border-b px-3",
              collapsed && "justify-center px-0",
            )}
          >
            <Brand compact={collapsed} />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain py-3">
            <SidebarNav collapsed={collapsed} />
          </div>
          <div className="shrink-0 border-t p-2.5">
            <SidebarProfile collapsed={collapsed} />
          </div>
        </aside>

        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            id="mobile-sidebar"
            side={dir === "rtl" ? "right" : "left"}
            className="w-80! max-w-[88vw]! gap-0 bg-card p-0 sm:max-w-[88vw]!"
          >
            <SheetTitle className="sr-only">{t("menuTitle")}</SheetTitle>
            <SheetDescription className="sr-only">{t("menuDescription")}</SheetDescription>

            <div className="flex h-(--header-h) shrink-0 items-center border-b px-4 ltr:pe-14 rtl:ps-14">
              <Brand />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain py-3">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="shrink-0 border-t p-3">
              <SidebarProfile onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Content */}
        <main
          id="main-content"
          className={cn(
            "flex min-h-dvh min-w-0 flex-col px-(--density-page-x) pt-[calc(var(--header-h)+var(--density-page-y))] transition-[padding] duration-200 ease-out",
            collapsed
              ? "md:ps-[calc(var(--sidebar-w-collapsed)+var(--density-page-x))]"
              : "md:ps-[calc(var(--sidebar-w)+var(--density-page-x))]",
          )}
        >
          <div className="mx-auto w-full max-w-[1600px] flex-1 pb-(--density-page-y) animate-page-in">
            {children}
          </div>
          <footer className="border-t py-4 text-xs text-muted-foreground">
            {tf.rich("rights", {
              year,
              name: t("appName"),
              companyName: t("company"),
              company: (chunks) => (
                <span className="font-semibold text-red-500 hover:text-red-400 cursor-pointer">{chunks}</span>
              ),
            })}
          </footer>
        </main>
      </div>
    </PermissionProvider>
  );
}
