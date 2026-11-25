// i18n audit: (1) fa/en key parity, (2) every t("key") used exists, (3) unused keys (info), (4) hardcoded UI text.
// Usage: node scripts/check-i18n.mjs [--strict-unused]
import fs from "node:fs";
import path from "node:path";

const strictUnused = process.argv.includes("--strict-unused");
const msgs = {
  fa: JSON.parse(fs.readFileSync("messages/fa.json", "utf8")),
  en: JSON.parse(fs.readFileSync("messages/en.json", "utf8")),
};
const flat = (o, p = "", out = new Set()) => {
  for (const [k, v] of Object.entries(o)) typeof v === "object" && v !== null ? flat(v, `${p}${k}.`, out) : out.add(p + k);
  return out;
};
const keys = { fa: flat(msgs.fa), en: flat(msgs.en) };
let bad = 0;
const report = (msg) => { console.log(msg); bad++; };

for (const k of keys.fa) if (!keys.en.has(k)) report(`missing in en: ${k}`);
for (const k of keys.en) if (!keys.fa.has(k)) report(`missing in fa: ${k}`);

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, a) => a);

const used = new Set();
const files = walk("src");
// Files that legitimately contain Persian data (server-side matching rules, theme bootstrap script, etc.)
// Escape hatch: a line containing `i18n-ignore` is skipped (technical samples, bilingual data records).
const HARDCODE_ALLOW = [/^src[\\/]lib[\\/]text[\\/]/, /^src[\\/]constants[\\/]/, /^src[\\/]components[\\/]shared[\\/]locale-switcher\.tsx$/, /^src[\\/]app[\\/]not-found\.tsx$/, /^src[\\/]components[\\/]layout[\\/]sidebar[\\/]menu-tree\.ts$/, /^src[\\/]lib[\\/]bff[\\/]/, /^src[\\/]lib[\\/]security[\\/]/, /^src[\\/]lib[\\/]auth[\\/]/, /^src[\\/]lib[\\/]env\.server\.ts$/, /^src[\\/]lib[\\/]mock[\\/]/, /^src[\\/]lib[\\/]digits\.ts$/];
const persian = /[\u0600-\u06FF]/;

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const s = stripComments(raw);

  // key usage
  for (const m of s.matchAll(/const (\w+) = (?:await )?(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*namespace:\s*)?"([^"]+)"/g)) {
    const [, v, ns] = m;
    const binds = [...s.matchAll(new RegExp(`const ${v} = (?:await )?(?:useTranslations|getTranslations)\\(`, "g"))].length;
    if (binds > 1) continue;
    for (const c of s.matchAll(new RegExp(`\\b${v}(?:\\.rich|\\.raw)?\\(\\s*"([^"]+)"`, "g"))) {
      const key = `${ns}.${c[1]}`;
      used.add(key);
      if (!keys.fa.has(key)) report(`${f}: unknown key ${key}`);
    }
  }
  for (const c of s.matchAll(/\bt\(\s*"([\w.]+)"/g)) used.add(c[1]);

  if (HARDCODE_ALLOW.some((r) => r.test(f))) continue;
  s.split("\n").forEach((line, i) => {
    if (line.includes("i18n-ignore")) return;
    if (persian.test(line)) report(`${f}:${i + 1}: hardcoded Persian text -> ${line.trim().slice(0, 90)}`);
  });
  // obvious hardcoded English UI attributes
  s.split("\n").forEach((line, i) => {
    if (line.includes("i18n-ignore")) return;
    const m = line.match(/\b(placeholder|aria-label|title|alt)="([A-Za-z][^"{}]{2,})"/);
    // technical identifiers (e.g. "users", "custom-menu-class", "Ctrl + K") are not translatable text
    if (m && !/^[\w.+-]+( \+ \w+)?$/.test(m[2])) report(`${f}:${i + 1}: hardcoded ${m[1]} -> "${m[2]}"`);
  });
}

// Unused keys (informational: dynamic keys such as t(`x.${y}`) cannot be resolved statically)
let unused = 0;
for (const k of keys.fa) if (![...used].some((u) => u === k || k.startsWith(`${u}.`))) unused++;
console.log(`info: ${unused} key(s) not referenced by a static t("…") call (may be used dynamically)`);
if (strictUnused && unused) bad += unused;

console.log(bad ? `${bad} problem(s)` : `i18n OK (${keys.fa.size} keys, fa/en in sync, no hardcoded text)`);
process.exit(bad ? 1 : 0);
