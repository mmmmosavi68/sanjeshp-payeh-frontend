// Codemod: moves hard-coded Persian strings into messages/{fa,en}.json using next-intl.
// Usage: node scripts/i18n-codemod.mjs extract   -> writes /tmp/i18n-missing.json (strings that need English)
//        node scripts/i18n-codemod.mjs apply     -> rewrites sources + messages (needs /tmp/en-map.json)
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const mode = process.argv[2];
const ROOT = "src";
const SKIP = [/not-found/, /options\.ts$/, /menu-tree\.ts$/, /schemas\//, /digits\.ts$/, /locale-switcher\.tsx$/, /\/mock\//, /use-sidebar-menu/];
const FA = /[\u0600-\u06FF]/;
const enMap = fs.existsSync("/tmp/en-map.json") ? JSON.parse(fs.readFileSync("/tmp/en-map.json", "utf8")) : {};

function walkDir(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const norm = (s) => s.replace(/\s+/g, " ").trim();
const camel = (s) => s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));

function nsFor(file) {
  const parts = file.replace(/\\/g, "/").split("/");
  const base = camel(path.basename(file).replace(/\.tsx?$/, ""));
  let feature;
  const fi = parts.indexOf("features");
  if (fi >= 0) feature = parts[fi + 1];
  else if (parts.includes("(dashboard)")) feature = parts[parts.indexOf("(dashboard)") + 1];
  else if (parts.includes("components")) feature = parts[parts.indexOf("components") + 1];
  else feature = "app";
  return `screens.${camel(feature)}.${base === "page" ? "page" : base.charAt(0).toLowerCase() + base.slice(1)}`;
}

function analyze(file) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const sites = [], unresolved = [];
  const consumed = new Set();

  const isFn = (n) => ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n);
  function component(node) {
    for (let n = node.parent; n; n = n.parent) {
      if (!isFn(n)) continue;
      let name = n.name?.getText();
      if (!name && ts.isVariableDeclaration(n.parent)) name = n.parent.name.getText();
      if (name && /^([A-Z]|use[A-Z])/.test(name)) return n;
    }
    return null;
  }
  const strText = (n) => (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) ? n.text : null);
  const cmpParent = (n) => {
    const p = n.parent;
    return (ts.isBinaryExpression(p) && /^[!=]==?$/.test(p.operatorToken.getText())) || ts.isCaseClause(p) || ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || (ts.isPropertyAssignment(p) && p.name === n) || ts.isElementAccessExpression(p);
  };
  const inJsxAttr = (n) => ts.isJsxAttribute(n.parent);

  function add(node, start, end, fa, en, params, jsxText) {
    const fn = component(node);
    const site = { start, end, fa, en, params, jsxText, attr: node.parent && ts.isJsxAttribute(node.parent), fn, line: sf.getLineAndCharacterOfPosition(start).line + 1 };
    if (!fn || !fn.body || !ts.isBlock(fn.body) || fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
      unresolved.push({ file, line: site.line, fa });
    } else sites.push(site);
  }

  function visit(node) {
    // 1) bilingual ternary: fa ? "فارسی" : "English"
    if (ts.isConditionalExpression(node)) {
      const cond = node.condition.getText();
      const a = strText(node.whenTrue), b = strText(node.whenFalse);
      const positive = /^(fa|isFa|isRtl|locale === ["']fa["'])$/.test(cond);
      const negative = /^(!fa|!isFa|!isRtl|locale !== ["']fa["'])$/.test(cond);
      if ((positive || negative) && a !== null && b !== null) {
        const [fa, en] = positive ? [a, b] : [b, a];
        if (FA.test(fa) && !FA.test(en)) {
          add(node, node.getStart(), node.getEnd(), norm(fa), norm(en));
          const mark = (n) => { consumed.add(n); n.forEachChild(mark); };
          mark(node);
          return;
        }
      }
    }
    if (consumed.has(node)) return;
    if (ts.isJsxText(node) && FA.test(node.text)) {
      const raw = node.getText();
      const lead = raw.length - raw.trimStart().length, trimmed = raw.trim();
      add(node, node.getStart() + lead, node.getStart() + lead + trimmed.length, norm(trimmed), undefined, undefined, true);
    } else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && FA.test(node.text) && !cmpParent(node)) {
      add(node, node.getStart(), node.getEnd(), norm(node.text));
    } else if (ts.isTemplateExpression(node) && FA.test(node.getText())) {
      let fa = node.head.text; const params = [];
      node.templateSpans.forEach((s) => {
        const ex = s.expression.getText();
        let name = /^[a-zA-Z_]\w*$/.test(ex) ? ex : `p${params.length}`;
        if (params.some((p) => p.name === name)) name = `p${params.length}`;
        params.push({ name, ex });
        fa += `{${name}}` + s.literal.text;
      });
      add(node, node.getStart(), node.getEnd(), norm(fa), undefined, params);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return { text, sf, sites, unresolved, ns: nsFor(file) };
}

const files = walkDir(ROOT).filter((f) => !SKIP.some((r) => r.test(f.replace(/\\/g, "/"))));
const results = files.map((f) => ({ file: f, ...analyze(f) })).filter((r) => r.sites.length || r.unresolved.length);

if (mode === "extract") {
  const need = new Set();
  const un = [];
  for (const r of results) {
    for (const s of r.sites) if (!s.en && !enMap[s.fa]) need.add(s.fa);
    un.push(...r.unresolved);
  }
  fs.writeFileSync("/tmp/i18n-missing.json", JSON.stringify([...need], null, 1));
  fs.writeFileSync("/tmp/i18n-unresolved.json", JSON.stringify(un, null, 1));
  console.log("files", results.length, "sites", results.reduce((a, r) => a + r.sites.length, 0), "missing English", need.size, "unresolved", un.length);
}

if (mode === "apply") {
  const msgs = { fa: JSON.parse(fs.readFileSync("messages/fa.json", "utf8")), en: JSON.parse(fs.readFileSync("messages/en.json", "utf8")) };
  const setMsg = (ns, key, fa, en) => {
    for (const [lang, val] of [["fa", fa], ["en", en]]) {
      let o = msgs[lang];
      for (const part of ns.split(".")) o = o[part] ??= {};
      o[key] = val;
    }
  };
  const esc = (s) => s.replace(/([{}])/g, "'$1'").replace(/'\{'(\w+)'\}'/g, "{$1}");
  const escParams = (s) => { // escape literal braces except our {param} placeholders
    return s.replace(/\{(?!\w+\})/g, "'{'").replace(/(?<!\{\w*)\}/g, (m, off) => m);
  };
  let total = 0;
  for (const r of results) {
    if (!r.sites.length) continue;
    const used = new Set();
    const keyOf = (en) => {
      const words = en.replace(/\{[^}]*\}/g, " ").split(/[^a-zA-Z0-9]+/).filter(Boolean).slice(0, 5);
      let base = words.length ? camel(words.join(" ").toLowerCase()) : "text";
      if (/^\d/.test(base)) base = "t" + base;
      let k = base, i = 2;
      while (used.has(k)) k = base + i++;
      used.add(k); return k;
    };
    const fnt = /\btl\b/.test(r.text) ? "tt" : "tl";
    const edits = [];
    const byFn = new Map();
    const cache = new Map();
    for (const s of r.sites) {
      const en = s.en || enMap[s.fa];
      if (!en) throw new Error("missing English for: " + s.fa);
      let key = cache.get(s.fa);
      if (!key) { key = keyOf(en); cache.set(s.fa, key); setMsg(r.ns, key, s.fa, en); }
      let call = s.params ? `${fnt}("${key}", { ${s.params.map((p) => (p.name === p.ex ? p.name : `${p.name}: ${p.ex}`)).join(", ")} })` : `${fnt}("${key}")`;
      if (s.jsxText || s.attr) call = `{${call}}`;
      edits.push({ start: s.start, end: s.end, text: call });
      byFn.set(s.fn, true);
      total++;
    }
    for (const fn of byFn.keys()) edits.push({ start: fn.body.getStart() + 1, end: fn.body.getStart() + 1, text: `\n  const ${fnt} = useTranslations("${r.ns}");` });
    // import
    if (!/import\s*\{[^}]*\buseTranslations\b[^}]*\}\s*from\s*["']next-intl["']/.test(r.text)) {
      const imports = r.sf.statements.filter(ts.isImportDeclaration);
      const pos = imports.length ? imports[imports.length - 1].getEnd() : 0;
      edits.push({ start: pos, end: pos, text: `\nimport { useTranslations } from "next-intl";` });
    }
    edits.sort((a, b) => b.start - a.start || b.end - a.end);
    let out = r.text;
    for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    // jsx attr: `attr="x"` replaced by `attr={tl(..)}` already handled by wrapping braces
    fs.writeFileSync(r.file, out);
  }
  fs.writeFileSync("messages/fa.json", JSON.stringify(msgs.fa, null, 2) + "\n");
  fs.writeFileSync("messages/en.json", JSON.stringify(msgs.en, null, 2) + "\n");
  console.log("replaced", total);
}
