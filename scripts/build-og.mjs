/* Generates the OG image (1200×630) and the PNG favicons from the brand SVGs.
   Composition per launch plan: Ink surface, white wordmark, Lime accent (the wave flags).
   Outputs are committed; re-run only when the logo changes.
   Geometry: the wordmark SVG is 695×290 (its first three paths are the wave flags),
   the wave mark is 254×265. Both are embedded as nested <svg> so no transform math. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');

const inner = (svg) => svg.replace(/<\?xml[^>]*\?>/, '').replace(/<svg[^>]*>/, '').replace('</svg>', '');

const wordmarkWhite = readFileSync(join(PUB, 'assets/dd-wordmark-white.svg'), 'utf8');
const waves = readFileSync(join(PUB, 'assets/dd-mark-lime.svg'), 'utf8');

/* Lime accent: the wordmark's three wave flags (its first three paths) go Lime, the type stays
   white — one accent, one statement, per the brand rules. */
let accented = inner(wordmarkWhite);
for (let i = 0; i < 3; i++) accented = accented.replace('fill="#FFFFFF"', 'fill="#C6F04B"');

const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <svg x="220" y="157" width="760" height="317" viewBox="0 0 695 290">${accented}</svg>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(join(PUB, 'og-image.png'));
console.log('og-image.png');

/* Favicon: Lime waves on Ink rounded square */
const iconSvg = (radius) => `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="${radius}" fill="#0A0A0A"/>
  <svg x="15" y="14" width="34" height="36" viewBox="0 0 254 265">${inner(waves)}</svg>
</svg>`;

writeFileSync(join(PUB, 'favicon.svg'), iconSvg(14));
await sharp(Buffer.from(iconSvg(14))).resize(32, 32).png().toFile(join(PUB, 'favicon-32.png'));
await sharp(Buffer.from(iconSvg(8))).resize(180, 180).png().toFile(join(PUB, 'apple-touch-icon.png'));
console.log('favicon.svg, favicon-32.png, apple-touch-icon.png');
