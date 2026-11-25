import { listCodes } from "./api";
import type { CodeDto } from "./types";

const TTL_MS = 60_000;

let cache: { at: number; promise: Promise<CodeDto[]> } | null = null;

/** Shared, short-lived cache of the full Codes list (one request for all Selects on a page). */
export function loadCodes(options: { force?: boolean } = {}): Promise<CodeDto[]> {
  const now = Date.now();
  if (!options.force && cache && now - cache.at < TTL_MS) return cache.promise;

  const promise = listCodes();
  cache = { at: now, promise };
  // A failed request must not be cached.
  promise.catch(() => {
    if (cache?.promise === promise) cache = null;
  });
  return promise;
}

export function invalidateCodes(): void {
  cache = null;
}
