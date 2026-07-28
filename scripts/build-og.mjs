/* Generates the OG image (1200×630) and the PNG favicons from the brand SVGs.
   Composition per launch plan: Ink surface, white wordmark, Lime accent (wave mark + marker bar).
   Outputs are committed; re-run only when the logo changes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');

const wordmark = readFileSync(join(PUB, 'assets/logo-wordmark-white.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '')
  .replace('<svg ', '<svg id="wm" ');
const waves = readFileSync(join(PUB, 'assets/mark-waves-lime.svg'), 'utf8');

/* Lime accent: the wordmark's three wave flags (its first three paths) go Lime, the type stays
   white — one accent, one statement, per the brand rules. */
let accented = wordmark;
for (let i = 0; i < 3; i++) accented = accented.replace('fill="#FFFFFF"', 'fill="#C6F04B"');

/* The wordmark's drawn content sits at x 172–866 / y 44–334 inside its 1036×379 box.
   Scaled ×1.25 the visible block is ~867×362 — the translate centres that block, not the box. */
const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <g transform="translate(-48,79) scale(1.25)">${accented.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(join(PUB, 'og-image.png'));
console.log('og-image.png');

/* Favicon: Lime waves on Ink rounded square */
const iconSvg = (size, radius) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="${radius}" fill="#0A0A0A"/>
  <g transform="translate(16,18)">${waves.replace('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 32 28">', '').replace('</svg>', '')}</g>
</svg>`;

writeFileSync(join(PUB, 'favicon.svg'), iconSvg(64, 14));
await sharp(Buffer.from(iconSvg(64, 14))).resize(32, 32).png().toFile(join(PUB, 'favicon-32.png'));
await sharp(Buffer.from(iconSvg(64, 8))).resize(180, 180).png().toFile(join(PUB, 'apple-touch-icon.png'));
console.log('favicon.svg, favicon-32.png, apple-touch-icon.png');
