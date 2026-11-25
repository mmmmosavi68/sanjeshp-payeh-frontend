const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_INDIC = "۰۱۲۳۴۵۶۷۸۹";

/** Converts Persian/Arabic-Indic digits to ASCII digits. */
export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (ch) => {
    const a = ARABIC_INDIC.indexOf(ch);
    return String(a >= 0 ? a : PERSIAN_INDIC.indexOf(ch));
  });
}

/**
 * Canonical form for search/compare: unifies ي/ی, ك/ک, ە/ه، digits, strips diacritics, ZWNJ, tatweel and case.
 */
export function normalizeSearchText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return toLatinDigits(String(value))
    .replace(/[يىئ]/g, "ی")
    .replace(/[كڪ]/g, "ک")
    .replace(/[ةە]/g, "ه")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/[\u064B-\u065F\u0670\u0640\u200c\u200d\u200e\u200f]/g, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** True when every whitespace-separated token of `query` is contained in any of `haystacks`. */
export function matchesSearch(query: string, ...haystacks: Array<string | number | null | undefined>): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const hay = haystacks.map(normalizeSearchText).join(" ");
  return q.split(" ").every((token) => hay.includes(token));
}
