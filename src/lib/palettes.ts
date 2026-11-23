import data from "./palettes.json";

/**
 * منبع واحد پالت‌های رنگی.
 * افزودن پالت جدید: یک خط در src/lib/palettes.json، سپس `npm run palettes:generate`
 * و افزودن کلید `common.palettes.<id>` در messages/fa.json و messages/en.json.
 */
export type Palette = string;

export type PaletteDefinition = {
  id: Palette;
  /** کلید ترجمه در namespace `common` */
  labelKey: `palettes.${string}`;
};

export const DEFAULT_PALETTE: Palette = "neutral";
export const PALETTE_STORAGE_KEY = "palette";

export const PALETTES: readonly PaletteDefinition[] = data.map((p) => ({
  id: p.id,
  labelKey: `palettes.${p.id}`,
}));

export const PALETTE_IDS: readonly Palette[] = PALETTES.map((p) => p.id);

export function isPalette(value: unknown): value is Palette {
  return typeof value === "string" && PALETTE_IDS.includes(value);
}

/** مقدار نامعتبر (مثلاً دست‌کاری‌شده در localStorage) به پالت پیش‌فرض برمی‌گردد. */
export function parsePalette(value: unknown): Palette {
  return isPalette(value) ? value : DEFAULT_PALETTE;
}
