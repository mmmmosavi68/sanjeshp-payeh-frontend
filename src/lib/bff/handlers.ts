import "server-only";
import type { NextRequest, NextResponse } from "next/server";

import { callBackend, type ClientContext } from "@/lib/api/backend";
import { refreshTokens, type Tokens } from "@/lib/auth/backend-session";
import { COOKIE } from "@/lib/auth/cookie-names";
import { setSessionCookies } from "@/lib/auth/cookies";

import { badGateway, loggedOut, relay, unauthorized } from "./responses";
import type { Method, Rule } from "./rules";
import { createSession } from "./session";

export type CallInput = ClientContext & {
  method: Method;
  path: string;
  search?: string;
  body?: string;
};

function logUpstream(error: unknown) {
  console.error("[bff] upstream error:", error instanceof Error ? error.message : "unknown");
}

export async function handlePublic(
  request: NextRequest,
  rule: Rule,
  input: CallInput,
): Promise<NextResponse> {
  try {
    const access = request.cookies.get(COOKIE.access)?.value;
    const result = await callBackend({ ...input, accessToken: access });
    return rule.session === "create" ? createSession(request, result) : relay(result);
  } catch (error) {
    logUpstream(error);
    return badGateway();
  }
}

export async function handleAuthed(
  request: NextRequest,
  rule: Rule,
  input: CallInput,
): Promise<NextResponse> {
  const state: { tokens: Tokens | null } = { tokens: null };
  let access = request.cookies.get(COOKIE.access)?.value;
  const refresh = request.cookies.get(COOKIE.refresh)?.value;

  const renew = async (): Promise<boolean> => {
    if (!refresh) return false;

    const tokens = await refreshTokens(refresh, {
      clientIp: input.clientIp,
      userAgent: input.userAgent,
    });

    if (!tokens) return false;

    state.tokens = tokens;
    access = tokens.accessToken;
    return true;
  };

  const call = () => callBackend({ ...input, accessToken: access });
  const isLogout = rule.session === "clear";

  try {
    if (!access && !(await renew())) {
      return isLogout ? loggedOut() : unauthorized();
    }

    let result = await call();

    if (result.status === 401 && !state.tokens && (await renew())) {
      result = await call();
    }

    if (isLogout) return loggedOut();
    if (result.status === 401) return unauthorized();

    const response = relay(result);
    if (state.tokens) setSessionCookies(response, state.tokens);

    return response;
  } catch (error) {
    logUpstream(error);
    return isLogout ? loggedOut() : badGateway();
  }
}
