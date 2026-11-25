"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTest, postTest, type TestRequest } from "@/features/home/api";
import { useTranslations } from "next-intl";

export default function ApiTestPage() {
  const tl = useTranslations("screens.apiTest.page");
  const locale = useLocale();
  const fa = locale === "fa";
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<TestRequest>({
    id: 1,
    name: "Test User",
    email: "test@example.com",
  });

  async function runGet() {
    setBusy(true);
    try {
      setResult(await getTest());
    } catch {
      toast.error(tl("getRequestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function runPost() {
    setBusy(true);
    try {
      setResult(await postTest(form));
    } catch {
      toast.error(tl("postRequestFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={tl("apiDiagnostics")}
        description={tl("homecontrollerGetAndPostTest")}
        crumbs={[{ label: tl("apiDiagnostics") }]}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={runGet}>{tl("getTest")}</Button>
        <Button variant="outline" disabled={busy} onClick={runPost}>{tl("postTest")}</Button>
      </div>
      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-3">
        <Input type="number" value={form.id} onChange={event => setForm(value => ({ ...value, id: Number(event.target.value) }))} aria-label={tl("fieldId")} />
        <Input value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} aria-label={tl("fieldName")} />
        <Input value={form.email} onChange={event => setForm(value => ({ ...value, email: event.target.value }))} aria-label={tl("fieldEmail")} />
      </div>
      <pre className="overflow-auto rounded-lg border bg-card p-4 text-xs" dir="ltr">
        {result ? JSON.stringify(result, null, 2) : (tl("noResponseYet"))}
      </pre>
    </div>
  );
}
