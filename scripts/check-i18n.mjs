// Static check: every t("key") used with useTranslations/getTranslations exists in BOTH fa.json and en.json,
// and fa/en have identical key sets. Usage: node scripts/check-i18n.mjs
import fs from "node:fs";
import path from "node:path";

const msgs = { fa: JSON.parse(fs.readFileSync("messages/fa.json", "utf8")), en: JSON.parse(fs.readFileSync("messages/en.json", "utf8")) };
const flat = (o, p = "", out = new Set()) => { for (const [k, v] of Object.entries(o)) typeof v === "object" ? flat(v, p + k + ".", out) : out.add(p + k); return out; };
const keys = { fa: flat(msgs.fa), en: flat(msgs.en) };
let bad = 0;
for (const k of keys.fa) if (!keys.en.has(k)) { console.log("missing in en:", k); bad++; }
for (const k of keys.en) if (!keys.fa.has(k)) { console.log("missing in fa:", k); bad++; }

function walk(d, out = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : /\.tsx?$/.test(e.name) && out.push(p); } return out; }
for (const f of walk("src")) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/const (\w+) = (?:await )?(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*namespace:\s*)?"([^"]+)"/g)) {
    const [, v, ns] = m;
    // Files that bind several namespaces to the same variable name are ambiguous; only check unambiguous ones.
    const binds = [...s.matchAll(new RegExp(`const ${v} = (?:await )?(?:useTranslations|getTranslations)\\(`, "g"))].length;
    if (binds > 1) continue;
    for (const c of s.matchAll(new RegExp(`\\b${v}(?:\\.rich|\\.raw)?\\(\\s*"([^"]+)"`, "g"))) {
      const key = `${ns}.${c[1]}`;
      if (!keys.fa.has(key)) { console.log(`${f}: unknown key ${key}`); bad++; }
    }
  }
}
console.log(bad ? `${bad} problem(s)` : `i18n OK (${keys.fa.size} keys, fa/en in sync)`);
process.exit(bad ? 1 : 0);
