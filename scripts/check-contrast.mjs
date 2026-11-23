// WCAG AA contrast audit for every palette (light + dark). Usage: node scripts/check-contrast.mjs
import fs from "node:fs";

const theme = fs.readFileSync("node_modules/tailwindcss/theme.css", "utf8");
const css = fs.readFileSync("src/styles/palettes.css", "utf8");

const twColors = {};
for (const m of theme.matchAll(/--color-([a-z]+-\d+):\s*oklch\(([^)]+)\)/g)) twColors[m[1]] = m[2];

function oklchToRgb(str) {
  const [l, c, h] = str.replace("%", "").split(/\s+/).map(Number);
  const L = str.includes("%") ? l / 100 : l;
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_, -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_, -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_];
  return lin.map((v) => Math.min(1, Math.max(0, v)));
}
function resolve(v) {
  v = v.trim();
  if (v === "#ffffff") return [1, 1, 1];
  const m = v.match(/var\(--color-([a-z]+-\d+)\)/);
  if (m) return oklchToRgb(twColors[m[1]]);
  throw new Error("unsupported " + v);
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const blocks = [...css.matchAll(/^(:root(?:\[data-palette="([a-z]+)"\])?|\.dark\[data-palette="([a-z]+)"\])[^{]*\{([^}]*)\}/gm)];
const palettes = {};
for (const b of blocks) {
  const id = b[2] || b[3] || "neutral"; const dark = b[1].startsWith(".dark");
  const vars = {}; for (const m of b[4].matchAll(/--([a-z-]+):\s*([^;]+);/g)) vars[m[1]] = m[2];
  (palettes[id] ??= {})[dark ? "dark" : "light"] = vars;
}
// status colours defined in globals.css (700 in light, 400 in dark)
const status = { light: { success: "emerald-700", warning: "amber-700", info: "blue-700" }, dark: { success: "emerald-400", warning: "amber-400", info: "blue-400" } };

let fails = 0;
for (const [id, modes] of Object.entries(palettes)) {
  for (const mode of ["light", "dark"]) {
    const v = modes[mode]; if (!v) continue;
    const pairs = [["foreground", "background"], ["muted-foreground", "background"], ["muted-foreground", "muted"], ["muted-foreground", "card"], ["primary-foreground", "primary"], ["primary", "background"], ["accent-foreground", "accent"], ["destructive", "background"], ["secondary-foreground", "secondary"]];
    const out = pairs.map(([f, b]) => [`${f}/${b}`, ratio(resolve(v[f]), resolve(v[b]))]);
    for (const [k, c] of Object.entries(status[mode])) out.push([`${k}/background`, ratio(oklchToRgb(twColors[c]), resolve(v.background))]);
    for (const [k, r] of out) if (r < 4.5) { fails++; console.log(`FAIL ${id} ${mode} ${k} = ${r.toFixed(2)}`); }
  }
}
console.log(`checked palettes: ${Object.keys(palettes).length}`);
console.log(fails ? `${fails} failing pairs` : "All palettes pass WCAG AA (>= 4.5:1) for tested pairs");
