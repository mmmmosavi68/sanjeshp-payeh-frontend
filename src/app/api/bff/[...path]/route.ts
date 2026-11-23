import { type NextRequest, type NextResponse } from "next/server";

import { ApiStatus } from "@/lib/api/errors";
import { handleAuthed, handlePublic, type CallInput } from "@/lib/bff/handlers";
import {
  MAX_QUERY,
  checkMutationGuards,
  clientContext,
  readJsonBody,
} from "@/lib/bff/guards";
import { fail } from "@/lib/bff/responses";
import { findRule, toBackendPath, type Method } from "@/lib/bff/rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  const method = request.method as Method;

  const rule = findRule(method, path);
  if (!rule) return fail(404, ApiStatus.NotFound, "Not found");

  if (method !== "GET") {
    const rejected = checkMutationGuards(request);
    if (rejected) return rejected;
  }

  let search: string | undefined;
  if (method === "GET") {
    search = request.nextUrl.search;
    if (search.length > MAX_QUERY) return fail(414, ApiStatus.BadRequest, "URI too long");
  }

  let body: string | undefined;
  if (method !== "GET") {
    const parsed = await readJsonBody(request);
    if (parsed.error) return parsed.error;
    body = parsed.body;
  }

  const input: CallInput = {
    ...clientContext(request),
    method,
    path: toBackendPath(path),
    search,
    body,
  };

  return rule.auth ? handleAuthed(request, rule, input) : handlePublic(request, rule, input);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
