/**
 * THE ONLY place that translates between UI code references (primaryCode/subCode) and API fields.
 *
 * UI layer  : every Select option / form value / filter is a `CodeKey` ("900:1" = primaryCode:subCode).
 * API layer : feature `api.ts` files call `toApiCodeFields()` / `readCodeKey()` from here.
 *
 * Backend today (refactor/professional-cleanup) accepts both `…Id` and `…PrimaryCode/…SubCode`.
 * While `NEXT_PUBLIC_API_CODE_FIELDS` is not "1" only the existing `…Id` is sent; flip the flag (or change
 * `API_SUPPORTS_CODE_FIELDS`) to start sending the new fields — no other file has to change.
 */
import { CODE_KEY_SEPARATOR } from "@/constants/codes";

import type { CodeDto } from "./types";

export type CodeRef = { primaryCode: number; subCode: number };
export type CodeKey = string;

export const API_SUPPORTS_CODE_FIELDS = process.env.NEXT_PUBLIC_API_CODE_FIELDS === "1";

/** Logical code fields that other DTOs reference, mapped to their API field names. */
export const CODE_REFERENCE_FIELDS = {
  examType: { id: "examTypeId", primary: "examTypePrimaryCode", sub: "examTypeSubCode" },
  examMode: { id: "examModeId", primary: "examModePrimaryCode", sub: "examModeSubCode" },
  universityType: { id: "universityTypeId", primary: "universityTypePrimaryCode", sub: "universityTypeSubCode" },
} as const;

export type CodeReferenceField = keyof typeof CODE_REFERENCE_FIELDS;

export function toCodeKey(ref: CodeRef): CodeKey {
  return `${ref.primaryCode}${CODE_KEY_SEPARATOR}${ref.subCode}`;
}

export function parseCodeKey(key: CodeKey | null | undefined): CodeRef | null {
  if (!key) return null;
  const [p, s, ...rest] = key.split(CODE_KEY_SEPARATOR);
  const primaryCode = Number(p);
  const subCode = Number(s);
  if (rest.length > 0 || p === "" || s === undefined || s === "" || !Number.isInteger(primaryCode) || !Number.isInteger(subCode)) return null;
  return { primaryCode, subCode };
}

export function codeRefOf(code: CodeDto): CodeRef | null {
  return code.primaryCode === null || code.subCode === null ? null : { primaryCode: code.primaryCode, subCode: code.subCode };
}

export function findCodeByKey(codes: readonly CodeDto[], key: CodeKey | null | undefined): CodeDto | null {
  const ref = parseCodeKey(key);
  if (!ref) return null;
  return codes.find((c) => c.primaryCode === ref.primaryCode && c.subCode === ref.subCode && c.subCode !== 0) ?? null;
}

/** Builds the request fields for one code reference, e.g. `{ examTypeId: 12 }` (+ primary/sub when supported). */
export function toApiCodeFields(
  field: CodeReferenceField,
  key: CodeKey | null | undefined,
  codes: readonly CodeDto[],
): Record<string, number> {
  const names = CODE_REFERENCE_FIELDS[field];
  const ref = parseCodeKey(key);
  if (!ref) return {};

  const out: Record<string, number> = {};
  const id = findCodeByKey(codes, key)?.id;
  if (id !== undefined) out[names.id] = id;
  if (API_SUPPORTS_CODE_FIELDS) {
    out[names.primary] = ref.primaryCode;
    out[names.sub] = ref.subCode;
  }
  return out;
}

type MaybeCodeFields = Partial<Record<string, number | null | undefined>>;

/** Reads a response's code reference as `CodeKey` (prefers primary/sub from the API, falls back to the Id). */
export function readCodeKey(
  field: CodeReferenceField,
  dto: MaybeCodeFields,
  codes: readonly CodeDto[],
): CodeKey | null {
  const names = CODE_REFERENCE_FIELDS[field];
  const primaryCode = dto[names.primary];
  const subCode = dto[names.sub];
  if (typeof primaryCode === "number" && typeof subCode === "number") return toCodeKey({ primaryCode, subCode });

  const id = dto[names.id];
  const code = typeof id === "number" ? codes.find((c) => c.id === id) : undefined;
  const ref = code ? codeRefOf(code) : null;
  return ref ? toCodeKey(ref) : null;
}
