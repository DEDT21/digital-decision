/* Prerendering nach dem Build (Teil von `npm run build`, siehe package.json):
     1. vite build                                   → dist/        (Client, leeres #root)
     2. vite build --ssr src/entry-server.jsx         → dist-ssr/    (Node-Bundle mit render())
     3. node scripts/prerender.mjs                    → füllt #root in dist/index.html
   Danach sehen Crawler und Nutzer ohne JS die komplette Seite, und der Browser hydriert nur
   noch (src/main.jsx → hydrateRoot), statt erst nach 70 KB JS etwas zu zeigen.

   Zusätzlich bricht das Script den Build ab, wenn
   - #root fehlt oder das Markup leer ist bzw. keine H1 enthält,
   - ein Inline-Script in dist/**.html keinen passenden sha256-Hash in der
     Content-Security-Policy (netlify.toml) hat (sonst blockiert der Browser es live),
   - das FAQPage-JSON-LD in index.html nicht wörtlich zu FAQS in src/Home.jsx passt.

   Für Tests in anderen Verzeichnissen: node scripts/prerender.mjs <distDir> <ssrDir> */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* Gleiche React-Variante wie im Browser-Bundle (Production). Muss vor dem Import stehen. */
process.env.NODE_ENV ??= 'production';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(process.argv[2] || join(ROOT, 'dist'));
const SSR = resolve(process.argv[3] || join(ROOT, 'dist-ssr'));

const errors = [];
const fail = (msg) => errors.push(msg);

/* ---------- 1. Server-Bundle laden und rendern ---------- */
const entry = ['entry-server.js', 'entry-server.mjs'].map((f) => join(SSR, f)).find((f) => existsSync(f));
if (!entry) {
  console.error(`prerender: kein Server-Bundle in ${SSR} gefunden (vite build --ssr gelaufen?)`);
  process.exit(1);
}
const mod = await import(pathToFileURL(entry).href);
let appHtml;
try {
  appHtml = mod.render();
} catch (e) {
  /* Typisch: window/document/matchMedia im Render oder in einem useState-Initialisierer. */
  console.error('prerender: <App /> lässt sich nicht serverseitig rendern.\n', e);
  process.exit(1);
}

if (!appHtml || appHtml.length < 500) fail('Gerendertes Markup ist leer oder verdächtig kurz.');
if (!/<h1[\s>]/.test(appHtml)) fail('Gerendertes Markup enthält keine <h1>.');

/* ---------- 2. In dist/index.html einsetzen ---------- */
const indexPath = join(DIST, 'index.html');
let indexHtml = readFileSync(indexPath, 'utf8');
const placeholder = '<div id="root"></div>';
const hits = indexHtml.split(placeholder).length - 1;
if (hits !== 1) {
  console.error(`prerender: erwartet genau ein ${placeholder} in ${indexPath}, gefunden: ${hits}. Schon vorgerendert?`);
  process.exit(1);
}
/* Funktion als Ersatz, damit "$" im Markup nicht als Ersetzungsmuster gilt. */
indexHtml = indexHtml.replace(placeholder, () => `<div id="root">${appHtml}</div>`);

/* ---------- 3. FAQPage-JSON-LD gegen FAQS prüfen ---------- */
const ldBlocks = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
let faqPage = null;
for (const block of ldBlocks) {
  let data;
  try { data = JSON.parse(block); } catch (e) { fail(`JSON-LD in index.html ist kein gültiges JSON: ${e.message}`); continue; }
  const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
  faqPage = nodes.find((n) => n['@type'] === 'FAQPage') || faqPage;
}
const faqs = Array.isArray(mod.FAQS) ? mod.FAQS.map((f) => (Array.isArray(f) ? f : [f.question ?? f.q, f.answer ?? f.a])) : null;
if (!faqs) {
  console.warn('prerender: FAQS nicht aus src/Home.jsx exportiert, FAQ-Abgleich übersprungen.');
} else if (!faqPage) {
  fail('Kein FAQPage-JSON-LD in index.html gefunden.');
} else {
  const ld = (faqPage.mainEntity || []).map((q) => [q.name, q.acceptedAnswer && q.acceptedAnswer.text]);
  const same = ld.length === faqs.length && ld.every(([q, a], i) => q === faqs[i][0] && a === faqs[i][1]);
  if (!same) fail('FAQPage-JSON-LD in index.html passt nicht wörtlich zu FAQS in src/Home.jsx. Beide Stellen synchron halten.');
}

/* ---------- 4. Inline-Scripts gegen die CSP prüfen ---------- */
const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
const cspLine = toml.split('\n').find((l) => /^\s*Content-Security-Policy\s*=/.test(l)) || '';
const allowed = new Set([...cspLine.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map((m) => m[1]));
if (!cspLine) fail('Keine Content-Security-Policy in netlify.toml gefunden.');

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const EXECUTABLE = new Set(['', 'text/javascript', 'application/javascript', 'module']);
for (const file of htmlFiles) {
  const html = file === indexPath ? indexHtml : readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = ((attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || '').toLowerCase();
    if (!EXECUTABLE.has(type)) continue; /* JSON-LD & Co. werden nicht ausgeführt, kein Hash nötig */
    const hash = createHash('sha256').update(m[2], 'utf8').digest('base64');
    if (!allowed.has(hash)) {
      fail(`Inline-Script in ${relative(DIST, file)} ist nicht per CSP freigegeben. In netlify.toml bei script-src ergänzen: 'sha256-${hash}'`);
    }
  }
}

/* ---------- 5. Netlify-Formular: genau eine registrierte Variante ---------- */
const netlifyForms = (indexHtml.match(/<form\b[^>]*\bdata-netlify\b/gi) || []).length;
if (netlifyForms !== 1) {
  console.warn(`prerender: ${netlifyForms} Formulare mit data-netlify in index.html (erwartet: 1, der statische Spiegel). Das React-Formular sollte kein data-netlify tragen.`);
}

if (errors.length) {
  console.error('\nprerender: Build abgebrochen\n- ' + errors.join('\n- ') + '\n');
  process.exit(1);
}

writeFileSync(indexPath, indexHtml);
const text = appHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log(`prerender: ${relative(process.cwd(), indexPath)} gefüllt (${(appHtml.length / 1024).toFixed(1)} KB Markup, ${text.length} Zeichen Text), ${htmlFiles.length} HTML-Dateien CSP-geprüft.`);
