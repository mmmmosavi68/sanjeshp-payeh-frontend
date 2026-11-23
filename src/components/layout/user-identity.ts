import type { Me } from "@/features/auth/me";

export function displayName(me: Me): string {
  const full = `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim();
  return full || me.userName;
}

export function initialsOf(me: Me): string {
  const first = Array.from(me.firstName?.trim() ?? "")[0];
  const last = Array.from(me.lastName?.trim() ?? "")[0];
  if (first && last) return `${first}${last}`;
  return Array.from(me.userName).slice(0, 2).join("").toUpperCase();
}
