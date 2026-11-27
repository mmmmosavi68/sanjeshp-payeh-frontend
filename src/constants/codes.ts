/**
 * Central registry of server-side "Codes" table groups.
 * Options everywhere in the UI are identified by (primaryCode, subCode) — never by title or numeric Id.
 * Group rows have `subCode === 0`; their items have `subCode > 0`.
 */
export const CODE_ROOT = { primaryCode: 0, subCode: 0 } as const;

export const CODE_GROUP_SUB_CODE = 0;

export const CODE_GROUPS = {
  universityType: 6,
  examType: 900,
  examMode: 901,
} as const;

export type CodeGroupKey = keyof typeof CODE_GROUPS;
export type CodeGroupPrimaryCode = (typeof CODE_GROUPS)[CodeGroupKey];

/** Separator used to serialize a code reference into a single Select value, e.g. "900:2". */
export const CODE_KEY_SEPARATOR = ":";

/**
 * Code groups used by the user form (read through `codes/groups/{primaryCode}/items`).
 * Values are unchanged from the previous inline numbers (gender=2, marital=1, religion=3, nationality=4, left-handed=5).
 */
export const USER_CODE_GROUPS = {
  maritalStatus: 16,
  gender: 18,
  religion: 21,
  nationality: 23,
  leftHanded: 574,
} as const;

/**
 * TODO(backend): replace with the stable `subCode` of the "electronic" exam mode (group 901) once confirmed.
 * Until then the exam-capacity screen keeps its previous title-based detection of electronic exams.
 */
export const ELECTRONIC_EXAM_MODE_TITLE_FRAGMENT = "الکترونیک";
