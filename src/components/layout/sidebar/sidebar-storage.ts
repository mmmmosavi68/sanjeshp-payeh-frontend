export const FAVORITES_STORAGE_KEY = "payeh-sidebar-favorites";
export const RECENT_STORAGE_KEY = "payeh-sidebar-recent";

export const MAX_FAVORITES = 2;
export const MAX_RECENT_ITEMS = 5;
export const VISIBLE_RECENT_ITEMS = 3;

export function readStorageArray(key: string): string[] {
  try {
    const value = localStorage.getItem(key);

    if (!value) return [];

    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

export function writeStorageArray(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // عدم دسترسی به Storage نباید مانع استفاده از سایدبار شود.
  }
}
