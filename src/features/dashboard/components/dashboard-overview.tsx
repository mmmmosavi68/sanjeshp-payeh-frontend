"use client";

import {
  Activity,
  ArrowUpRight,
  KeyRound,
  Laptop,
  MonitorSmartphone,
  Smartphone,
  Stethoscope,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/features/auth/me";
import { listSessions } from "@/features/sessions/api";
import { listRoles } from "@/features/users/api";
import { useRemoteData } from "@/hooks/use-remote-data";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { SessionRecord } from "@/types/session";

// نمودار فقط پس از رسیدن داده بارگذاری می‌شود (code splitting).
const SessionsChart = dynamic(
  () => import("./sessions-chart").then((module) => module.SessionsChart),
  { loading: () => <Skeleton className="h-52 w-full" /> },
);

const deviceIcons: Record<SessionRecord["deviceType"], LucideIcon> = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

type StatTone = "primary" | "success" | "info";

const toneClasses: Record<StatTone, string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
};

type StatProps = {
  label: string;
  hint: string;
  value?: number;
  icon: LucideIcon;
  tone: StatTone;
  delay: number;
};

function Stat({ label, hint, value, icon: Icon, tone, delay }: StatProps) {
  const format = useFormatter();

  return (
    <article
      className="surface surface-hover animate-fade-up p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
            {value === undefined ? <Skeleton className="h-9 w-16" /> : format.number(value)}
          </p>
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", toneClasses[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </article>
  );
}

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const locale = useLocale();

  const me = useRemoteData("me", getMe);
  const sessions = useRemoteData("dashboard-sessions", listSessions);
  const roles = useRemoteData("dashboard-roles", listRoles);

  const failed = sessions.failed || roles.failed;
  const latest = (sessions.data ?? []).slice(0, 5);
  const now = new Date();

  const name = me.data
    ? `${me.data.firstName ?? ""} ${me.data.lastName ?? ""}`.trim() || me.data.userName
    : "";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {name ? t("v2.greetingNamed", { name }) : t("v2.greeting")}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("v2.subtitle")}</p>
          {failed ? (
            <Badge variant="warning" className="mt-3">
              {t("v2.status.partial")}
            </Badge>
          ) : (
            <Badge variant="success" className="mt-3">
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {t("v2.status.live")}
            </Badge>
          )}
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={t("title")}>
        <Stat
          label={t("v2.cards.sessions")}
          hint={t("v2.cards.sessionsHint")}
          value={sessions.loading ? undefined : sessions.data?.length}
          icon={MonitorSmartphone}
          tone="primary"
          delay={0}
        />
        <Stat
          label={t("v2.cards.roles")}
          hint={t("v2.cards.rolesHint")}
          value={roles.loading ? undefined : roles.data?.length}
          icon={KeyRound}
          tone="success"
          delay={60}
        />
        <Stat
          label={t("v2.cards.current")}
          hint={t("v2.cards.currentHint")}
          value={sessions.loading ? undefined : sessions.data?.filter((s) => s.current).length}
          icon={Activity}
          tone="info"
          delay={120}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Chart */}
        <section className="surface animate-fade-up p-5 xl:col-span-3" style={{ animationDelay: "160ms" }}>
          <h2 className="text-base font-semibold">{t("v2.chart.title")}</h2>
          <p className="mb-5 mt-0.5 text-sm text-muted-foreground">{t("v2.chart.description")}</p>
          {sessions.loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <SessionsChart createdAt={(sessions.data ?? []).map((s) => s.createdAt)} />
          )}
        </section>

        {/* Latest sessions */}
        <section className="surface animate-fade-up p-5 xl:col-span-2" style={{ animationDelay: "220ms" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">{t("v2.recentSessions.title")}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t("v2.recentSessions.description")}</p>
            </div>
            <Link
              href="/sessions"
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              {t("v2.recentSessions.viewAll")}
              <ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>

          <ul className="mt-4 divide-y">
            {sessions.loading
              ? Array.from({ length: 4 }, (_, index) => (
                  <li key={index} className="flex items-center gap-3 py-3">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))
              : latest.map((session) => {
                  const Icon = deviceIcons[session.deviceType];
                  return (
                    <li key={session.id} className="flex items-center gap-3 py-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{session.device}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {format.relativeTime(new Date(session.lastActiveAt), now)}
                        </p>
                      </div>
                      {session.current ? <Badge variant="success">{t("v2.recentSessions.current")}</Badge> : null}
                    </li>
                  );
                })}
            {!sessions.loading && latest.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">{t("v2.recentSessions.empty")}</li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* Quick links */}
      <section aria-label={t("v2.quickLinks.title")} className="flex flex-wrap gap-3">
        <Link
          href="/sessions"
          className="surface surface-hover inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium"
        >
          <MonitorSmartphone className="size-4 text-primary" aria-hidden />
          {t("v2.quickLinks.sessions")}
        </Link>
        {process.env.NODE_ENV !== "production" && (
          <Link
            href="/api-test"
            className="surface surface-hover inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium"
          >
            <Stethoscope className="size-4 text-primary" aria-hidden />
            {t("v2.quickLinks.diagnostics")}
          </Link>
        )}
      </section>

      <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground" lang={locale}>
        {t("v2.notice")}
      </p>
    </div>
  );
}
